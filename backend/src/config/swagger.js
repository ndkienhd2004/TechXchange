const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TechXchange API",
      version: "1.0.0",
      description:
        "API documentation for TechXchange - Marketplace Platform with Authentication",
      contact: {
        name: "TechXchange Team",
        email: "support@techxchange.com",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000/api",
        description: "Development Server",
      },
      {
        url: "https://api.techxchange.com/api",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            username: {
              type: "string",
              example: "username",
            },
            phone: {
              type: "string",
              example: "0123456789",
            },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              example: "male",
            },
            role: {
              type: "string",
              enum: ["user", "shop", "admin"],
              example: "user",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Đăng nhập thành công",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
                accessToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                refreshToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "password123",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "password123",
            },
            username: {
              type: "string",
              example: "username",
            },
            phone: {
              type: "string",
              example: "0123456789",
            },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              example: "male",
            },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["oldPassword", "newPassword", "confirmPassword"],
          properties: {
            oldPassword: {
              type: "string",
              format: "password",
              example: "password123",
            },
            newPassword: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "newpassword123",
            },
            confirmPassword: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "newpassword123",
            },
          },
        },
        UpdateProfileRequest: {
          type: "object",
          properties: {
            username: {
              type: "string",
              example: "newusername",
            },
            phone: {
              type: "string",
              example: "0987654321",
            },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              example: "female",
            },
          },
        },
        UsersList: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
            },
            data: {
              type: "object",
              properties: {
                total: {
                  type: "integer",
                  example: 50,
                },
                users: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/User",
                  },
                },
                page: {
                  type: "integer",
                  example: 1,
                },
                totalPages: {
                  type: "integer",
                  example: 5,
                },
              },
            },
          },
        },
        PublicUser: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            username: {
              type: "string",
              example: "username",
            },
          },
        },
        StoreRequestUser: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            username: {
              type: "string",
              example: "username",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
          },
        },
        ProductCategory: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Laptop",
            },
          },
        },
        Brand: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Apple",
            },
            image: {
              type: "string",
              example: "https://example.com/brand.png",
            },
          },
        },
        BrandRequest: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            requester_id: {
              type: "integer",
              example: 5,
            },
            admin_id: {
              type: "integer",
              example: 2,
            },
            brand_id: {
              type: "integer",
              example: 10,
            },
            name: {
              type: "string",
              example: "Acme",
            },
            image: {
              type: "string",
              example: "https://example.com/acme.png",
            },
            status: {
              type: "string",
              example: "pending",
            },
            admin_note: {
              type: "string",
              example: "Thieu minh chung",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
            brand: {
              $ref: "#/components/schemas/Brand",
            },
          },
        },
        BannerDetail: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            banner_id: {
              type: "integer",
              example: 2,
            },
            product_id: {
              type: "integer",
              example: 10,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
            product: {
              $ref: "#/components/schemas/Product",
            },
          },
        },
        Banner: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Back to School",
            },
            image: {
              type: "string",
              example: "https://example.com/banner.jpg",
            },
            status: {
              type: "integer",
              example: 1,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
            details: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BannerDetail",
              },
            },
          },
        },
        Store: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "TechX Store",
            },
            rating: {
              type: "number",
              example: 4.5,
            },
            description: {
              type: "string",
              example: "Cua hang do cong nghe",
            },
          },
        },
        CreateStoreRequest: {
          type: "object",
          required: ["store_name"],
          properties: {
            store_name: {
              type: "string",
              example: "TechX Store",
            },
            store_description: {
              type: "string",
              example: "Cua hang do cong nghe",
            },
          },
        },
        StoreRequest: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            user_id: {
              type: "integer",
              example: 10,
            },
            store_id: {
              type: "integer",
              example: 2,
            },
            store_name: {
              type: "string",
              example: "TechX Store",
            },
            store_description: {
              type: "string",
              example: "Cua hang do cong nghe",
            },
            status: {
              type: "string",
              example: "pending",
            },
            admin_id: {
              type: "integer",
              example: 1,
            },
            admin_note: {
              type: "string",
              example: "Da duyet",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
            admin: {
              $ref: "#/components/schemas/PublicUser",
            },
            user: {
              $ref: "#/components/schemas/StoreRequestUser",
            },
            store: {
              $ref: "#/components/schemas/Store",
            },
          },
        },
        StoreRequestList: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
            },
            data: {
              type: "object",
              properties: {
                total: {
                  type: "integer",
                  example: 1,
                },
                requests: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/StoreRequest",
                  },
                },
                page: {
                  type: "integer",
                  example: 1,
                },
                totalPages: {
                  type: "integer",
                  example: 1,
                },
              },
            },
          },
        },
        ProductImage: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            url: {
              type: "string",
              example: "https://example.com/product.jpg",
            },
            sort_order: {
              type: "integer",
              example: 0,
            },
          },
        },
        ProductAttribute: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            attr_key: {
              type: "string",
              example: "CPU",
            },
            attr_value: {
              type: "string",
              example: "Intel i7",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            category_id: {
              type: "integer",
              example: 2,
            },
            seller_id: {
              type: "integer",
              example: 3,
            },
            store_id: {
              type: "integer",
              example: 4,
            },
            brand_id: {
              type: "integer",
              example: 5,
            },
            name: {
              type: "string",
              example: "MacBook Pro 16",
            },
            description: {
              type: "string",
              example: "May tinh xach tay",
            },
            price: {
              type: "number",
              example: 1200.5,
            },
            quality: {
              type: "string",
              example: "like_new",
            },
            condition_percent: {
              type: "integer",
              example: 90,
            },
            rating: {
              type: "number",
              example: 4.7,
            },
            buyturn: {
              type: "integer",
              example: 10,
            },
            quantity: {
              type: "integer",
              example: 5,
            },
            status: {
              type: "string",
              example: "active",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
            category: {
              $ref: "#/components/schemas/ProductCategory",
            },
            brand: {
              $ref: "#/components/schemas/Brand",
            },
            store: {
              $ref: "#/components/schemas/Store",
            },
            seller: {
              $ref: "#/components/schemas/PublicUser",
            },
            images: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ProductImage",
              },
            },
            attributes: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ProductAttribute",
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
