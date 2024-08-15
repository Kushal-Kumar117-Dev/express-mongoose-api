const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const ApiData = require('./modal/api-model');

const app = express();
const PORT = 5001;
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'r.kushal729@gmail.com',  
        pass: 'fqtp fbch gexd wbey',   
    },
});

app.get('/', async (req, res) => {
    let data;
    try {  
        data = await ApiData.find();
    } catch (err) {
        console.log(err);
        res.json({"msg":"success","err":err}).status(500);
    }
    if(data) {
        res.json({"msg":"success","data":data}).status(200);
    }
});

app.post('/add-data', async (req,res) => {
    const {name, email, phone, age, profile} = req.body;
    let existingUser = await ApiData.findOne({$or: [
        { email: email },
        { phone: phone } 
      ]});
    if(existingUser) {
        return res.status(400).json(
            {"status":"User creation failed", "msg":"user exists already email or phone", "data":existingUser}
        );
    }
    const insertData = new ApiData({
        name,
        email,
        phone,
        age,
        profile
    });
    try {
        await insertData.save();
    } catch(err) {
        if(err) console.log(err); 
        return res.json({"msg":"failed","data_status":"Data insertion failed","data":req.body}).status(500);
    }
    return res.json({"msg":"success","data_status":"Data inserted","data":req.body}).status(200);
});

app.patch('/update-data/:id', async (req,res) => {
    const {name, age, profile} = req.body;
    let user;
    try {
        user = await ApiData.findById(req.params.id);
    } catch(err) {
    if(err) console.log(err);
        return res.status(500).json({"status":"failed","msg":"server error"});
    }
    if(!user) {
        return res.status(404).json({"msg":"success", "msg":"user not found"});
    }
    user.name = name;
    user.age = age;
    profile.map((item) => {
    user.profile.push(item);  
    });
    try {
        await user.save();
    } catch(err) {
        return res.status(500).json({"status":"failed","msg":"not saved error occured"});
    }
    return res.status(200).json({"msg":"success", "id":req.params.id, "data":user});
});

app.delete('/delete/:id', async (req,res) => {
    let user;
    try {
        user = await ApiData.findById(req.params.id);
    } catch(err) {
        if(err) console.log(err);
        return res.status(500).json({"status":"failed","msg":"server error"}); 
    }
    if(!user) {
        return res.status(404).json({"status":"success","msg":"user not found"});
    }
    try {
        await ApiData.findByIdAndDelete(req.params.id);
    } catch(err) {
        return res.status(500).json({"status":"failed","msg":"data not deleted"});
    }
    return res.status(200).json({"status":"success","msg":"deleted"});    
});

app.post('/api/send-email', (req,res) => {
   const {to, cc, bcc, subject, email_body} = req.body;
   // console.log('body ' + req.body);
   const mailOptions = {
    from: 'r.kushal729@gmail.com',
    to: to, 
    subject: subject,
    text: email_body
    };
    if(cc) mailOptions.cc = cc;
    if(bcc) mailOptions.bcc = bcc;
    // return res.status(200).json({"status":"success","mail_data":mailOptions});

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
       return res.status(200).send('Email sent: ' + info.response);
    });
});

mongoose.connect('mongodb://localhost:27017/api-db')
.then(() => {
    app.listen(PORT, (err) => {
        if(err) console.log('err' + err);
     });
})
.catch((err) => {
  console.log(err);
});