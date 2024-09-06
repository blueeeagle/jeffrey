const bcrypt = require('bcryptjs');

const adminData = require('../../../models/adminmodel');


exports.singUp = async (req, res, next) => {
    console.log(req.body);
    try {

        const adminregister = new adminData({

            name: req.body.name,
            email: req.body.email,
            password: req.body.password,

        });

        const token = await adminregister.authToken();
        console.log(token);

        const result = await adminregister.save()

        if (adminData) {
            // res.redirect('/')

            res.send({

                Data: result, status: 1, message: 'Admin Data register Success'
            })
        }
        else {
            res.send({ data: {}, status: 0, message: 'Admin can not insert Data' })
        }


    } catch (error) {
        console.log(error);
        res.send({ status: 0, message: error.message })
    }
}

// adminLogin
exports.login = async (req, res, next) => {
    try {

        const Email = req.body.email;
        const password = req.body.password;

        console.log("Email=>>>>>>>>>>>>>", Email, "password=>>>>>>>>>>", password)

        const userEmail = await adminData.findOne({ email: Email })
        if (!userEmail) {
            req.flash('error', 'Email Mismatch')
           return res.render('admin', { message: req.flash('error') })
        }

        if (userEmail) {

            const validPassWord = await bcrypt.compare(password, userEmail.password);
            console.log("validPassWord=>>", validPassWord)

            if (!validPassWord) {

                req.flash('error', 'Password Mismatch')
                return res.render('admin', { message: req.flash('error') })
                // res.render('index')
            }

            if (validPassWord) {
                // if (userEmail.role === "super_admin") {
                var obj = {}

                obj.email = userEmail.email
                obj.id = userEmail._id,
                    obj.name = userEmail.name
                obj.role = userEmail.role
                req.session.isLoggedin = true,
                    req.session.adminLogin = userEmail,
                    res.locals.admin = userEmail
                // res.locals.admin = userEmail.role

                console.log('res.locals.admin', res.locals.admin);

                return res.redirect('/dashboard');


            } else {
                // req.flash('error_msg', 'Email and Password Wrong');
                // req.flash('error',    'Can Not Match Cradantials')
                res.render('admin')



            }
        }
    } catch (error) {
        console.log("error=>>>>>>>>>>>", error);
    }


}


exports.findAdminData = async (req, res, next) => {

    try {

        const findAdminData = await adminData.findById(req.params.id)
        console.log('this_is_test', findAdminData)
        res.render('adminprofile', { record: findAdminData })

    } catch (error) {
        console.log(error);
    }

}



// update 
exports.updateAdminData = async (req, res, next) => {

    try {

        if (req.file) {
            const result = await adminData.findByIdAndUpdate(req.body.id, {

                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                image: req.file.location,

            }, { new: true })
            console.log('reeeeeeeeeeeee'.result);
            req.flash('success', '  update data successfully')

            res.redirect('/adminprofile')
            // res.send(result);

        }
        else {

            const result = await adminData.findByIdAndUpdate(req.body.id, {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,

            }, { new: true })
            console.log('hshshshshshs', result);


            req.flash('success', ' update data successfully')
            res.redirect('adminprofile')

            res.redirect('/adminprofile')

            // res.send(result);
        }

    } catch (error) {
        console.log(error);

    }

};



exports.updateAdminPassword = async (req, res, next) => {
    try {

        console.log(req.body);
        const reqbody = req.body

        let adminPass = await adminData.findById(reqbody.id);
        console.log(adminPass);
        const old_pass = await bcrypt.compare(reqbody.old_pass, adminPass.password)


        console.log('RAJA>>>>>>>>>>>>>>>', old_pass);


        if (!adminPass.password === old_pass) {

            console.log('Old pass not match');
            req.flash('error', ' old pass not match')
            res.redirect('/adminprofile')
            // res.send({message: 'old pass not match'})
        }
        else {
            adminPass.password = await bcrypt.hash(reqbody.new_pass, 10);

            console.log('RAjaaaaaa', adminPass.password);

            const changePass = await adminData.findByIdAndUpdate(reqbody.id, { password: adminPass.password }, { new: true });
            console.log(changePass);

            req.flash('error', ' your password change successfully')
            res.redirect('/');
            // res.send({message :'success'})

        }
        // if (!adminPass.validPassword(reqbody.old_pass)) return console.log("Admin Old Password Not Match");

    } catch (error) {
        console.log(error);
    }

}



// logout
exports.logout = (req, res, next) => {
    //console.log(" this is logout session", req.session);
    console.log('this is logout 11111111');
    console.log("logout Api 11111111", req.session.isLoggedin);
    req.session.isLoggedin = true
    try {

        req.session.isLoggedin = null
        // res.header('Cache-Control', 'no-cache');
        console.log(" this is logout session", req.session);


        req.flash('error', ' logged out successfully')
        res.redirect('/')

    } catch (error) {
        res.send("user Logout not Work", error)
    }
}
