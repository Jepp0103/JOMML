const router = require('express').Router();
const User = require("../models/User.js");
const session = require('express-session');

//Defining file system as a standard library.
const fs = require("fs");

//GET METHODS
router.get("/", (req, res) => {
    return res.redirect("/home");
});

router.get("/createUser", (req, res) => {
    if(!req.session.login){
    const nav = fs.readFileSync("./public/navbar/publicNavbar.html", "utf8");
    const page = fs.readFileSync("./public/user/createUser.html", "utf8");
    const foot = fs.readFileSync("./public/footer/footer.html", "utf8");

    return res.send(nav + page + foot);
    }
    else {
        return res.redirect("/home")
    }

});

router.get("/updateUserData", async (req, res) => {
    if(req.session.login){
            const accountInfo = await User.query().select("first_name", "last_name", "username", "password", "email", "phone_number", "address", "zip_code", "city").where("id", req.session.userId);
            const firstName = accountInfo[0].firstName;
            const lastName = accountInfo[0].lastName;
            const username = accountInfo[0].username;
            const password = accountInfo[0].password;
            const email = accountInfo[0].email;
            const phoneNumber = accountInfo[0].phoneNumber;
            const address = accountInfo[0].address;
            const zipCode = accountInfo[0].zipCode;
            const city = accountInfo[0].city;

            console.log("First name and last name", firstName, lastName);
            return res.send({ response: {
                firstName: firstName, 
                lastName: lastName,
                username: username,
                password: password,
                email: email,
                phoneNumber: phoneNumber,
                address: address,
                zipCode: zipCode,
                city: city
                }});
    } else {
        return res.redirect("/login");
    }
});

router.get("/updateUser", async (req, res) => {
    if(req.session.login){
            const head = fs.readFileSync("./public/navbar/navbar.html", "utf8");
            const page = fs.readFileSync("./public/user/updateUser.html", "utf8");
            const foot = fs.readFileSync("./public/footer/footer.html", "utf8");
        return res.send(head + page + foot);
    } else {
        return res.redirect("/login");
    }
});

router.get("/login", (req, res) => {
    if(!req.session.login){
    const head =fs.readFileSync("./public/navbar/publicNavbar.html", "utf8")
    const page = fs.readFileSync("./public/login/login.html", "utf8")
    const foot = fs.readFileSync("./public/footer/footer.html", "utf8")
    return res.send(head + page + foot);
    }
    else {
        return res.redirect("/home")
    }
});

 router.get("/home", (req, res) => {
    if(req.session.login) {
        const head = fs.readFileSync("./public/navbar/navbar.html", "utf8");
        const foot = fs.readFileSync("./public/footer/footer.html", "utf8");
        const page = fs.readFileSync("./public/home/home.html", "utf8");
        return res.send(head + page + foot);

    } else {
        const head = fs.readFileSync("./public/navbar/publicNavbar.html", "utf8");
        const foot = fs.readFileSync("./public/footer/footer.html", "utf8");
        const page = fs.readFileSync("./public/home/home.html", "utf8");
        return res.send(head + page + foot);
    }
});

router.get("/getUsername", (req, res) => {
    return res.send({ response: req.session });
});

//POST METHODS
//Validation
router.post("/createUser",(req, res) => {
    const { password,
            confirmPassword,
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            zipCode,
            city,
            username } = req.body;


    try{
        //Password validation
        if (password && confirmPassword && firstName && lastName && email && phoneNumber && address && zipCode && city && username) {

            const CapLetterRegex = /[A-Z]+/g
            const NumbersRegex = /[0-9]/g
            const EmailRegex = /[@]+/g
            const PhoneRegex = /\d{8}/g
            const ZipRegex = /\d{4}/g
            const wordRegex = /\w+/g

            if (password && confirmPassword) {

                if (password.length < 8) {
                    return res.status(400).send({ response: "Password must be 8 characters or longer"});
                }

                if (password !== confirmPassword) {
                    return res.status(400).send({ response: "Password and confirm password needs to be the same"});
                }

                if (CapLetterRegex.test(password) == false){
                    return res.status(400).send({ response: "Password should contain minimum one capital letter"});
                }

                if (NumbersRegex.test(password) == false) {
                    return res.status(400).send({ response: "Password should contain minimum one digit"});
                }

            if (email) {
                if (!email.match(EmailRegex)) {
                    return res.status(400).send({ response: "Email skal indeholde @"});
                }
            }

            if (phoneNumber){
                if(!phoneNumber.match(PhoneRegex)){
                    return res.status(400).send({ response: "Phonenumber should contain 8 digits"});
                }

                if (phoneNumber.length > 8) {
                    return res.status(400).send({ response: "Phonenumber must be 8 digits long"});
                }
            }

            if (zipCode) {
                if (!zipCode.match(ZipRegex)){
                    return res.status(400).send({ response: "Zipcode should contain 4 digits"});
                }

                if (zipCode.length > 4) {
                    return res.status(400).send({ response: "Zipcode must be 4 digits long"});
                }
            }

            if(firstName && lastName && address && city && username) {
                if(!firstName.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }

                if(!lastName.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }

                if(!address.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }

                if(!city.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }

                if(!username.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }
            }

            User.query().insert({
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                email: req.body.email,
                phone_number: req.body.phoneNumber,
                address: req.body.address,
                zip_code: req.body.zipCode,
                city: req.body.city,
                username: req.body.username,
                password: req.body.password
            }).then(createdUser => {
                return res.redirect("/login")
            })

        }
        }
        } catch {
    }

    console.log(req.body);
});

//Checks if the user input is the same as in the database//
router.post('/home', async (req, res) => {
    const { username, password } = req.body;
    try {
        const accountInfo = await User.query().select("id", "username", "password").where("username", username);
        if (accountInfo.length !== 1) {
            return res.redirect("/login")
        }
        if (accountInfo.length === 1) {
            if (password === accountInfo[0].password) {
                req.session.userId = accountInfo[0].id;
                req.session.login = true;
                req.session.username = username;
                console.log("Session id:", accountInfo[0].id)
                return res.redirect("/home");
            }
        }
    }
    catch(error) {
        return res.send(error);
    }
});

router.post("/logout", (req, res) => {
    req.session.login = undefined;
    req.session.username = undefined;
    return res.redirect("/login");
});

//PUT METHODS
//Validation
router.post("/updateUser",(req, res) => {
    const { password,
            confirmPassword,
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            zipCode,
            city,
            username } = req.body;


    try{
        //Password validation
        if (confirmPassword !== password) {
            console.log("testing confirmpassword != password")
            return res.redirect("/updateUser");
        }

        if (password && confirmPassword && firstName && lastName && email && phoneNumber && address && zipCode && city && username) {

            const CapLetterRegex = /[A-Z]+/g
            const NumbersRegex = /[0-9]/g
            const EmailRegex = /[@]+/g
            const PhoneRegex = /\d{8}/g
            const ZipRegex = /\d{4}/g
            const wordRegex = /\w+/g

            if (password && confirmPassword) {

                if (password.length < 8) {
                    return res.status(400).send({ response: "Password must be 8 characters or longer"});
                }

                if (CapLetterRegex.test(password) == false){
                    return res.status(400).send({ response: "Password should contain minimum one capital letter"});
                }

                if (NumbersRegex.test(password) == false) {
                    return res.status(400).send({ response: "Password should contain minimum one digit"});
                }

            if (email) {
                if (!email.match(EmailRegex)) {
                    return res.status(400).send({ response: "Email skal indeholde @"});
                }
            }

            if (phoneNumber){
                if(!phoneNumber.match(PhoneRegex)){
                    return res.status(400).send({ response: "Phonenumber should contain 8 digits"});
                }

                if (phoneNumber.length > 8) {
                    return res.status(400).send({ response: "Phonenumber must be 8 digits long"});
                }
            }

            if (zipCode) {
                if (!zipCode.match(ZipRegex)){
                    return res.status(400).send({ response: "Zipcode should contain 4 digits"});
                }

                if (zipCode.length > 4) {
                    return res.status(400).send({ response: "Zipcode must be 4 digits long"});
                }
            }

            if(firstName && lastName && address && city && username) {
                if(!firstName.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }

                if(!lastName.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }

                if(!address.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }

                if(!city.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }

                if(!username.match(wordRegex)) {
                    return res.status(400).send({ response: "Cannot be null"});
                }
            }

            User.query().where('id', req.session.userId).update({
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                email: req.body.email,
                phone_number: req.body.phoneNumber,
                address: req.body.address,
                zip_code: req.body.zipCode,
                city: req.body.city,
                username: req.body.username,
                password: req.body.password
            }).then(createdUser => {
                return res.redirect("/updateUser");
            })
        }
        }
        } catch {
    }

    console.log(req.body);
});

module.exports = router;
