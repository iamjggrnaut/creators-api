const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        info: {
            title: 'Your API Documentation',
            version: '1.0.0',
            description: 'Documentation for your RESTful API',
        },
    },
    apis: ['../routes/*.js'], // Путь к вашим маршрутам API
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;