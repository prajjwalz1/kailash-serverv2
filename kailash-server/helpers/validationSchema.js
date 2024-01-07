const Joi = require('@hapi/joi')

const groupsSchema = Joi.object({
    name:Joi.string().required(),
    location:Joi.string().allow("").allow(null),
    warehouse:Joi.required(),
    site:Joi.allow("").allow(null),
    organization_id:Joi.required(),
})

const siteSchema = Joi.object({
    organization_id:Joi.required(),
    name:Joi.string().required(),
    state:Joi.string().allow("").allow(null),
    street:Joi.string().allow("").allow(null),
    city:Joi.string().required(),
    image:Joi.string().allow("").allow(null),
    starting_date:Joi.date().allow("").default(Date.now()),
    estimated_completion_date:Joi.date().allow("").default(Date.now()),
    allocated_budget:Joi.number().allow(0).allow("").allow(null)
})


const receiptSchema = Joi.object({
    name:Joi.string().required(),
    supplier:Joi.allow(null).allow(""),
    organization_id:Joi.required(),
    image:Joi.string().allow(null).allow(""),
    receipt_date:Joi.date().required(),
    total_amount:Joi.number().allow(null).allow("").allow(0),
})

const machineSchema = Joi.object({
    name:Joi.string().required(),
    vehicleNo:Joi.string().required(),
    organization_id:Joi.required(),
})

const userContactSchema = Joi.object({
    city:Joi.string(),
    street:Joi.string(),
    mobile_number:Joi.string(),
})


const userSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).required(),
    roles: Joi.array().required(),
    title:Joi.string(),
    full_name:Joi.string().required(),
    dob:Joi.date().allow("").allow(null),
    gender:Joi.string().required(),
    isAdmin:Joi.boolean().required(),
    monthly_salary:Joi.number().required(),
    salary_start_date:Joi.date(),
    next_salary_date:Joi.date(),
    total_spent:Joi.date(),
    warehouse:Joi.required(),
    user_contact:userContactSchema,
    organization_id:Joi.required()
})

const authSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).required(),
})

const organizationSchema = Joi.object({
    username: Joi.string().max(30).required(),
    name:Joi.string().max(100).required()
})


const supplierSchema = Joi.object({
    city:Joi.string(),
    state:Joi.string(),
    street:Joi.string(),
    name:Joi.string(),
    phone:Joi.string(),
    organization_id:Joi.required()
})

const categorySchema = Joi.object({
    name:Joi.string().max(100).required(),
    type:Joi.string().max(50).required(),
    organization_id:Joi.required()
})

const brandSchema = Joi.object({
    name:Joi.string().max(100).required(),
    organization_id:Joi.required()
})

const productSchema = Joi.object({
    organization_id:Joi.required(),
    category:Joi.required(),
    brand:Joi.required(),
    name:Joi.string().max(200).required(),
    tax:Joi.number().allow("").allow(0).allow(null),
    total_amount:Joi.number().positive().required(),
    total_stock:Joi.number().positive().required(),
    warehouses:Joi.array(),
    groups:Joi.array(),
    sites:Joi.array(),
    past_history:Joi.array()
})

const editingSchema = Joi.object({
    warehouse_start:Joi.required(),
    type:Joi.string(),
    product_id:Joi.required(),
    stock_count:Joi.required(),
    retail_price:Joi.required(),
    total_amount:Joi.required()
})

const itemsSchema = Joi.object({
    tax:Joi.number().positive(),
    name:Joi.string().required(),
    retail_price:Joi.number().positive().required(),
    total:Joi.number().positive().required(),
    quantity:Joi.number().positive(),
    staff:Joi.required(),
    item:Joi.required(),
    onModel:Joi.string().required()
})

const salesSchema = Joi.object({
    items:Joi.array().allow("").allow(null),
    organization_id:Joi.required(),
    invoice_date:Joi.date().required(),
    total_amount:Joi.number().required(),
    note:Joi.string().allow("").allow(null)
})

const warehouseSchema = Joi.object({
    name:Joi.string(),
    city:Joi.string(),
    state:Joi.string(),
    street:Joi.string(),
    warehouse_owner:Joi.required(),
    mobile_number:Joi.string(),
    organization_id:Joi.required(),
})
const approvalSchema = Joi.object({
    warehouse_start:Joi.string().allow("").allow(null),
    warehouse_end:Joi.string().allow("").allow(null),
    group_start:Joi.string().allow("").allow(null),
    group_end:Joi.string().allow("").allow(null),
    site_start:Joi.string().allow("").allow(null),
    site_end:Joi.string().allow("").allow(null),
    status:Joi.string().allow("").allow(null),
    supplier:Joi.string().allow("").allow(null),
    product_id:Joi.string().allow("").allow(null),
    group:Joi.string().allow("").allow(null),
    machine:Joi.string().allow("").allow(null),
    stock_count:Joi.number().positive(),
    added_by:Joi.string().allow("").allow(null),
    retail_price:Joi.number(),
    type:Joi.string().required(),
    total_price:Joi.required(),
    organization_id:Joi.required(),
    isApproved:Joi.required()
})

module.exports = {
    siteSchema,
    userSchema,
    authSchema,
    organizationSchema,
    categorySchema,
    brandSchema,
    supplierSchema,
    productSchema,
    salesSchema,
    warehouseSchema,
    approvalSchema,
    machineSchema,
    receiptSchema,
    groupsSchema
}