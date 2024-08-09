const express =require('express')
const {graphqlHTTP}= require('express-graphql')
const connectdb=require('./config/db')
const schema=require('./schemas/graphqlschemas')

const app=express()
const port=process.env.PORT || 4000

connectdb()

app.use('/graphql', graphqlHTTP({
    schema, 
    graphiql: true
}))

app.listen(port, ()=> {
    console.log("API running at port 4000/graphql")
})
