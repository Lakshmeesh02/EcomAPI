const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLFloat, GraphQLList } = require('graphql');
const ProductModel = require('../models/product');
const UserModel=require('../models/user');

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

const userType = new GraphQLObjectType({
    name: 'User',
    fields: ()=> ({
        id: { type: GraphQLString}, 
        username: { type: GraphQLString}, 
        password: { type: GraphQLString}
    }),
})

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
        users: {
            type: new GraphQLList(userType),
            resolve(parent, args) {
                return UserModel.find();
            },
        },
        userById: {
            type: userType,
            args: {id: {type: GraphQLString}},
            resolve(parent, args) {
                return UserModel.findById(args.id)
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

        addUser: {
            type: userType, 
            args : {
                username: { type: GraphQLString},
                password: { type: GraphQLString}
            },
            resolve(parent, args) {
                const user=new UserModel({
                    username: args.username, 
                    password: args.password
                })
                return user.save()
            }
        }
    },
});

module.exports = new GraphQLSchema({
    query: rootQuery,
    mutation: mutation,
});
