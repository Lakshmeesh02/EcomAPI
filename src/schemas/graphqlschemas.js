const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLFloat, GraphQLList, GraphQLInt } = require('graphql');
const ProductModel = require('../models/product');
const UserModel=require('../models/user');
const OrdersModel=require('../models/orders');

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

const orderType = new GraphQLObjectType({
    name: 'Order', 
    fields: ()=> ({
        id: {type: GraphQLString}, 
        userId: {type: GraphQLString}, 
        products: {
            type: new GraphQLList(
                new GraphQLObjectType({
                    name: 'OrderProduct',
                    fields: ()=> ({
                        productId: {type: GraphQLString}, 
                        quantity: {type: GraphQLFloat}
                    }),
                })
            )
        },
        totalamount: {type: GraphQLFloat}
    })
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

        productById: {
            type: productType,
            args: {id: {type: GraphQLString}}, 
            resolve(parent, args) {
                return ProductModel.findById(args.id)
            }
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

        orders: {
            type: new GraphQLList(orderType),
            resolve(parent, args) {
                return OrdersModel.find();
            },
        },

        orderByUserId: {
            type: orderType,
            args: {id: {type: GraphQLString}},
            resolve(parent, args) {
                return OrdersModel.find({userId: args.userId})
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
        },

        addOrder: {
            type: orderType,
            args: {
                userId: {type: GraphQLString},
                productId: {type: GraphQLString}, 
                quantity: {type: GraphQLFloat}
            },
            async resolve(parent, args) {
                const product=await ProductModel.findById(args.productId)
                let order=await OrdersModel.findOne({ userId: args.userId})

                if(!order) {
                    order=new OrdersModel({
                        userId: args.userId,
                        products: [],
                        totalamount: 0
                    })
                }

                const existingproductindex=order.products.findIndex(p=>p.productId.toString()===args.productId)
                if(existingproductindex!==-1) {
                    const existingproduct=order.products[existingproductindex]
                    existingproduct.quantity+=args.quantity
                    order.totalamount+=product.price*args.quantity
                }
                else {
                    order.products.push({
                        productId: args.productId,
                        quantity: args.quantity
                    })
                    order.totalamount+=product.price*args.quantity
                }
                return await order.save()
            },
        },

        deleteUser: {
            type: GraphQLString, 
            args: {
                id: {type: GraphQLString}
            },
            async resolve(parent, args) {
                const user=await UserModel.deleteOne({_id: args.id})
                const order=await OrdersModel.deleteOne({userId: args.id})
                return "User and his orders removed"
            }
        }, 

        deleteProduct: {
            type: GraphQLString, 
            args: {
                id: { type: GraphQLString}
            }, 
            async resolve(parent, args) {
                const deletedproduct=await ProductModel.findByIdAndDelete(args.id)
                const orderstoupdate=await OrdersModel.find({ 'products.productId': args.id })
                for(let order of orderstoupdate) {
                    const producttoremove=order.products.find(p=> p.productId.toString()===args.id)
                    if(producttoremove) {
                        const pricereduction=producttoremove.quantity*deletedproduct.price
                        order.totalamount-=pricereduction
                        order.products=order.products.filter(p=> p.productId.toString()!==args.id)
                        await order.save()
                    }
                }
                return "Product deleted everywhere"
            }
        }, 

        deleteOrder: {
            type: orderType, 
            args: {
                userId: {type: GraphQLString}, 
                productId: {type: GraphQLString}
            }, 
            async resolve(parent, args) {
                const deletedorder=await OrdersModel.findOne({userId: args.userId})
                const productIndex=deletedorder.products.findIndex(p=> p.productId.toString()===args.productId)
                const producttodelete=await ProductModel.findById(args.productId)
                const pricetoreduce=producttodelete.price*deletedorder.products[productIndex].quantity
                deletedorder.products.splice(productIndex, 1)
                deletedorder.totalamount-=pricetoreduce

                if(deletedorder.products.length==0) {
                    await OrdersModel.findByIdAndDelete(deletedorder._id)
                    return null
                }
                else
                return await deletedorder.save()
            }
        }
    },
});

module.exports = new GraphQLSchema({
    query: rootQuery,
    mutation: mutation,
});
