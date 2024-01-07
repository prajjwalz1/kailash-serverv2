require('dotenv').config()
require('./helpers/database')
const bodyParser = require('body-parser');
const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
const authRoute = require('./routes/auth.routes')
const categoryRoute = require('./routes/category.routes')
const brandRoute = require('./routes/brand.routes')
const supplierRoute = require('./routes/supplier.routes')
const productRoute = require('./routes/product.routes')
const userRoute = require('./routes/user.routes')
const salesRoute = require('./routes/sales.routes')
const warehouseRoute = require('./routes/warehouse.routes')
const approvalRoute = require('./routes/approval.routes')
const machinesRoute = require('./routes/machines.routes')
const receiptRoute = require('./routes/receipts.routes')
const dashboardRoute = require('./routes/dashboard.routes')
const groupRoute = require('./routes/groups.routes')
const siteRoute = require('./routes/site.routes')


const { verifyAccessToken } = require('./helpers/jwtHelper')

const app = express()
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: "5mb" ,extended: true, parameterLimit: 50000 }));

const cors = require('cors')
app.use(cors({origin:"*"}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

const PORT = process.env.PORT || 3001

app.get('/', verifyAccessToken, async (req, res) => {
    res.send("Welcome Welcome!")
})




// all the routes initialization
app.use('/auth', authRoute)
app.use('/', categoryRoute)
app.use('/', brandRoute)
app.use('/', supplierRoute)
app.use('/', productRoute)
app.use('/', userRoute)
app.use('/', salesRoute)
app.use('/', warehouseRoute)
app.use('/', approvalRoute)
app.use('/', machinesRoute)
app.use('/', receiptRoute)
app.use('/', dashboardRoute)
app.use('/', groupRoute)
app.use('/', siteRoute)



app.use(async (req, res, next) => {
    next(createError.NotFound('This is not working '))
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log('icon')
})