//     require("dotenv").config();
//     const express = require("express")
//     const connectDB = require("./src/config/db")
//     const authRoutes = require("./src/router/auth.routes");
//     const productRoutes = require("./src/router/product.routes");
//     const orderRoutes = require("./src/router/order.routes")
//     const cookieParser = require("cookie-parser");
//     const paymentRoutes =  require("./src/router/payment.routes");
//     const analyticsRoutes = require("./src/router/analytics.routes");
//      const cors = require("cors");
//     connectDB();


//     const app= express();
    


// app.use(cors({
//   origin: 'http://localhost:5174', // ← Tera frontend URL
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'] // ← Ye 2 zaroori hai
// }));
//     app.use(express.json())
//     app.use(express.urlencoded({ extended: true }));
//     app.use(cookieParser())
//     app.use("/api/auth",authRoutes)
//     app.use("/api/products",productRoutes)
//     app.use("/api/orders",orderRoutes)
//     app.use("/api/payment", paymentRoutes);
//     app.use("/api/analytics",analyticsRoutes)




//     app.listen(process.env.PORT,()=>{
//         console.log("Server is running on 4000  port...")
//     })

//     module.exports = app;


require("dotenv").config();
const express = require("express")
const connectDB = require("./src/config/db")
const authRoutes = require("./src/router/auth.routes");
const productRoutes = require("./src/router/product.routes");
const orderRoutes = require("./src/router/order.routes")
const cookieParser = require("cookie-parser");
const paymentRoutes = require("./src/router/payment.routes");
const analyticsRoutes = require("./src/router/analytics.routes");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');

connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// ✅ Complete Swagger Spec with all routes
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce API',
    version: '1.0.0',
    description: 'MERN E-Commerce Backend APIs'
  },
  servers: [{ url: 'http://localhost:4000/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Address: {
        type: 'object',
        properties: {
          fullname: { type: 'string', example: 'Rohit Kumar' },
          street: { type: 'string', example: 'Khedi Road' },
          city: { type: 'string', example: 'Nagpur' },
          postalCode: { type: 'string', example: '441501' },
          country: { type: 'string', example: 'India' }
        }
      },
      OrderItem: {
        type: 'object',
        properties: {
          product: { type: 'string', example: '64f1b2c3d4e5f6a7b8c9d0e1' },
          quantity: { type: 'number', example: 2 },
          price: { type: 'number', example: 299 }
        }
      }
    }
  },
  tags: [
    { name: 'Auth', description: 'Authentication APIs' },
    { name: 'Products', description: 'Product APIs' },
    { name: 'Orders', description: 'Order APIs' },
    { name: 'Payment', description: 'Razorpay Payment APIs' },
    { name: 'Analytics', description: 'Analytics APIs' }
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Rohit Kumar' },
                  email: { type: 'string', example: 'rohit@gmail.com' },
                  password: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'User registered successfully' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'rohit@gmail.com' },
                  password: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Login successful' } }
      }
    },
    '/auth/users': {
      get: {
        summary: 'Get logged in user details',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'User details' } }
      }
    },
    '/auth/logout': {
      get: {
        summary: 'Logout user',
        tags: ['Auth'],
        responses: { '200': { description: 'Logout successful' } }
      }
    },
    '/products': {
      get: {
        summary: 'Get all products',
        tags: ['Products'],
        responses: {
          '200': {
            description: 'List of products',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      price: { type: 'number' },
                      image: { type: 'string' },
                      description: { type: 'string' },
                      category: { type: 'string' },
                      stock: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create new product - Admin only',
        tags: ['Products'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  description: { type: 'string' },
                  image: { type: 'string' },
                  category: { type: 'string' },
                  stock: { type: 'number' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Product created' } }
      }
    },
    '/products/{id}': {
      get: {
        summary: 'Get single product by ID',
        tags: ['Products'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: { '200': { description: 'Product details' } }
      },
      put: {
        summary: 'Update product - Admin only',
        tags: ['Products'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: { '200': { description: 'Product updated' } }
      },
      delete: {
        summary: 'Delete product - Admin only',
        tags: ['Products'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: { '200': { description: 'Product deleted' } }
      }
    },
    '/orders': {
      get: {
        summary: 'Get all orders of logged in user',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of user orders',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/OrderItem' }
                      },
                      totalAmount: { type: 'number' },
                      address: { $ref: '#/components/schemas/Address' },
                      paymentStatus: { type: 'string' },
                      createdAt: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/orders/{id}': {
      get: {
        summary: 'Get order by ID',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: { '200': { description: 'Order details' } }
      }
    },
    '/payment/createorder': {
      post: {
        summary: 'Create Razorpay order',
        tags: ['Payment'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', example: 299 }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Razorpay order created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    order: { type: 'object' },
                    key_id: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/payment/verify': {
      post: {
        summary: 'Verify Razorpay payment',
        tags: ['Payment'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'orderData'],
                properties: {
                  razorpay_order_id: { type: 'string' },
                  razorpay_payment_id: { type: 'string' },
                  razorpay_signature: { type: 'string' },
                  orderData: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/OrderItem' }
                      },
                      totalAmount: { type: 'number' },
                      address: { $ref: '#/components/schemas/Address' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Payment verified & order saved' } }
      }
    },
    '/analytics': {
      get: {
        summary: 'Get analytics data - Admin only',
        tags: ['Analytics'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Analytics data' } }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes)

app.listen(process.env.PORT, () => {
    console.log("Server is running on 4000 port...")
    console.log("Swagger: http://localhost:4000/api-docs")
})

module.exports = app;