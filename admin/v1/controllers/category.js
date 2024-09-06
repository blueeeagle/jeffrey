const categoryData = require ('../../../models/category')


exports.add_category = async (req,res,next)=>{
    try {   
        console.log("body=>>>>" , req.body)
        const addCategory = new categoryData({
            name : req.body.name
        })
        console.log("addCategory=>>>" ,addCategory)
        addCategory.save()
        res.redirect('/categorylist')

    }
    catch(error){
        console.log("error=>>>" , error)
    }
}

exports.categoryList = async (req,res,next)=>{
    try {
        const categoryList = await categoryData.find()
        res.render( "categoryList" , {categoryList :categoryList})
    }
    catch (error){
        console.log("error=>>>" , error)
    }
}

exports.deleteCategory = async (req,res,next)=>{
    try {
        const categoryList = await categoryData.find()
        res.render( "categoryList" , {categoryList :categoryList})
    }
    catch (error){
        console.log("error=>>>" , error)
    }
}

exports.editCategory = async (req,res,next)=>{
    try {
        const catId  = req.params.catId
        const category = await categoryData.findById(catId)
        console.log("cate........",category)
        res.render( "editCategory" , {data :category})
    }
    catch (error){
        console.log("error=>>>" , error)
    }
}

exports.updateCategory = async (req,res,next)=>{
    try {
        const catId  = req.body.catId
        const category = await categoryData.findById(catId)

        if(category){

            category.name = req.body.name

            await category.save();
           return res.redirect( "categoryList")
        }else{
            return res.redirect( "categoryList")
        }
    }
    catch (error){
        console.log("error=>>>" , error)
    }
}

