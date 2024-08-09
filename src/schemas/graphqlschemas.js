const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLFloat, GraphQLList } = require('graphql');
const ProductModel = require('../models/product'); // Renamed import

const productType = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLString },
        productname: { type: GraphQLString },
        price: { type: GraphQLFloat },
        description: { type: GraphQLString },
        category: { type: GraphQLString },
    }),
});

const rootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        products: {
            type: new GraphQLList(productType),
            resolve(parent, args) {
                return ProductModel.find(); // Fetch all products
            },
        },
        productByCategory: {
            type: new GraphQLList(productType),
            args: { category: { type: GraphQLString } },
            resolve(parent, args) {
                return ProductModel.find({category: args.category}); // Fetch a single product by ID
            },
        },
    },
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addProduct: {
            type: productType,
            args: {
                productname: { type: GraphQLString },
                price: { type: GraphQLFloat },
                description: { type: GraphQLString }, // Corrected typo
                category: { type: GraphQLString },
            },
            resolve(parent, args) {
                const product = new ProductModel({ // Use the renamed model
                    productname: args.productname,
                    price: args.price,
                    description: args.description, // Corrected typo
                    category: args.category,
                });
                return product.save();
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: rootQuery,
    mutation: mutation,
});
