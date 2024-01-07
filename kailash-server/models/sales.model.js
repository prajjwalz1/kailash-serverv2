const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Product = require('./product.model')

const SalesInvoiceNumber = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 1000, unique:true, required:true }
});
const counter = mongoose.model('sales_counter', SalesInvoiceNumber);

const SalesSchema = new Schema({
    invoice_no:{
        type:String,
        unique:true
    },
    items:{
        type:Array,
        default:[]
    },
    total_amount:{
        type:Number,
        required:true
    },
    organization_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"organization",
        required:true
    },
    invoice_date:{
        type:Date,
        required:true
    },
    note:{
        type:String,
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
    updated_at:{
        type:Date,
        default:Date.now()
    },
    deleted_at:{
        type:Date,
        default:null
    },
})

SalesSchema.pre('save', function (next){
    var doc = this
    counter.findByIdAndUpdate({_id: 'entityId'}, {$inc: { seq: 1} }, {new: true, upsert: true}).then(function(count) {
        doc.invoice_no = count.seq;
        for(let item in doc.items){
            if(doc.items[item].onModel === 'product'){
                Product.findByIdAndUpdate({_id: doc.items[item].item.value}, {$inc: { purchaseCount: doc.items[item].quantity, purchaseAmount: doc.items[item].total} }, {new: true, upsert: true}).then(function(count) {
                    next();
                }).catch(function(error) {
                    console.error("counter error-> : "+error);
                    next(error)
                });
            }
        }
        next();
    })
    .catch(function(error) {
        console.error("counter error-> : "+error);
        next(error)
    });
})

//create a pre hook to check for isPaid

const Sales = mongoose.model('sales',SalesSchema)

module.exports = Sales