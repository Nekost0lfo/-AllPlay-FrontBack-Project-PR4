const express = require("express");
const path = require("path");
const cors = require("cors");

const { ApolloServer, gql } = require("apollo-server-express");

const http = require("http");
const { Server } = require("socket.io");

const fs = require("fs");

const PORT = 3000;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "../data/products.json");

const app = express();

app.use(cors());

function readProducts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) || [];
  } catch (err) {
    console.error("Ошибка чтения JSON:", err);
    return [];
  }
}

const typeDefs = gql`
  type Product {
    id: ID!
    name: String
    price: Float
  }

  type Query {
    # Список ВСЕХ товаров (только id, name, price)
    products: [Product]

    # Один товар по ID
    product(id: ID!): Product
  }
`;

const resolvers = {
  Query: {
    products: () => {
      const products = readProducts();
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
      }));
    },
    product: (_, args) => {
      const products = readProducts();
      const found = products.find((p) => String(p.id) === String(args.id));
      if (!found) return null;
      return {
        id: found.id,
        name: found.name,
        price: found.price,
      };
    },
  },
};

async function startApollo() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
}

app.use(express.static(path.join(__dirname, "../frontend")));

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("[WS] Пользователь подключился:", socket.id);

  socket.on("chatMessage", (msg) => {
    console.log(`[WS] Сообщение от ${socket.id} (${msg.role}):`, msg.text);
    io.emit("chatMessage", {
      text: msg.text,
      role: msg.role,
      senderId: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("[WS] Пользователь отключился:", socket.id);
  });
});

async function start() {
  await startApollo();

  httpServer.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}/admin.html`);
    console.log(`Сервер запущен: http://localhost:${PORT}/`);
    console.log(`GraphQL доступен по адресу: http://localhost:${PORT}/graphql`);
  });
}

start().catch((err) => {
  console.error("Ошибка запуска сервера:", err);
});
