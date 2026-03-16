## Features and Technologies for my Social Media App project

### Frontend (in Typescript)
Some of the frontend features and technologies used in this project include:

- Implemented **React component design patterns** for better structure and reusability  
- Added **Dark Mode support** with global state managed via **Redux**  
- Implemented **request caching, cache invalidation, infinite scrolling, and optimistic updates** using **RTK Query**  
- Implemented **client-side routing and data loaders** using **React Router**

**Features currently in progress:**
- Improved **form validation**
- **Post comments** system
- **Private chats and group chats**
- **Real-time notifications**

---

### Backend

The backend is designed using a **microservices architecture** with **event-driven communication**.

Key backend features include:

- Implemented **microservices architecture** with **RabbitMQ event-driven messaging**
- Designed **REST APIs** and a **real-time communication layer** using **Node.js, Express, and Socket.IO**
- Centralized routing through an **API Gateway**  
  (see `api-gateway/middleware/proxy.js` for the list of endpoints)
- Implemented **real-time notifications and messaging** using **WebSockets**
- Optimized **MongoDB queries** with proper indexing and **cursor-based pagination**
- Integrated **Redis** for **caching** and **online user presence management**
- Implemented **user session handling** and **rate-limiting middleware** for **security and performance**
