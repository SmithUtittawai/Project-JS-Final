const router = require('express').Router();
const stdModel = require('./../models/student');
const tecModel = require('./../models/teacher');
const courseModel = require('../models/course');


router.use('/std', require('./student'));
router.use('/tec', require('./teacher'));


router.get('/sayhi', (req, res) => {
    res.json({ msg: 'Hello am router' });
});



router.get('/checkStudentLogin/:course_id/:sec/:std_id', async (req, res) => {
    
    try {

        let course_id = req.params.course_id;
        let sec = req.params.sec;
        let std_id = req.params.std_id;

        let findCourse = await courseModel.findOne({ course_id: course_id, 'course_section.checkTime.students': std_id });
        
        if (findCourse) {
            res.status(200).json({statusCheckIn: true, val: findCourse, msg: 'Checked-in'});
        } else {
            res.status(200).json({statusCheckIn: false, val: findCourse, msg: 'Absent'});
        }

    } catch (err) { res.status(500).json({ msg: err.message }) }

});



router.get('/getCheckIn/:course_id/:sec', async (req, res) => {

    try {

        let now = new Date();
        let findCourse = await courseModel.findOne({ course_id: req.params.course_id });
        let findSection = findCourse.course_section.find(val => val.sec == parseInt(req.params.sec));

        let statusFound = false;

        for (let checkIn of findSection.checkTime) {
            let dateTime = new Date(checkIn.date);
            console.log('day', dateTime.getDate(), 'now', now.getDate());
            console.log('month', dateTime.getMonth(), 'now', now.getMonth());
            console.log('year', dateTime.getFullYear(), 'now', now.getFullYear());
            if (dateTime.getDate() === now.getDate() && dateTime.getMonth() === now.getMonth() && dateTime.getFullYear() === now.getFullYear()) {
                statusFound = checkIn;
                console.log('checkIn', checkIn);
                break;
            }
        }
        if (statusFound) {
            res.status(200).json({ val: statusFound, msg: 'success' });
        } else {
            res.status(200).json({ val: null, msg: 'not found' });
        }


    } catch (err) { res.json({ msg: err.message }); }

})


//! Course routes
router.post('/insertCourse', (req, res) => {

    try {
        
        let data = req.body;

        if (data.course_id === '' || data.course_name === '' || data.cours_section === null) {
            throw new Error('Please fill all field');
        }

        let course = new courseModel(data);
        course.save();

        res.status(200).json({ val: course, msg: 'inserted' });

    } catch (err) { res.status(500).json({ msg: err.message }); }

});


router.post('/login', async (req, res) => {
    try {

        let data = req.body;

        //! student login
        if (data.statusLogin === 'std') {
            
            if (data.std_id === '' || data.std_pwd === '') {
                throw new Error('Please fill all field');
            }
            
            let student = await stdModel.findOne({std_id: data.std_id, std_pwd: data.std_pwd});
                
            if (student) {
                req.session.dataUser = student;
                res.status(200).json({ status: 'std', val: student, msg: 'Login Success' });
            } else {
                throw new Error('Id or Password invaild');
            }
            
        //! teacher login
        }
        else if (data.statusLogin === 'tec') {

            if (data.tec_id === '' || data.tec_pwd === '') {
                throw new Error('Please fill all field');
            }

            let teacher = await tecModel.findOne({tec_id: data.tec_id, tec_pwd: data.tec_pwd});
           
            if (teacher) {
                req.session.dataUser = teacher;
                res.status(200).json({ status: 'tec', val: teacher, msg: 'Login Success' });
            } else {
                throw new Error('Id or Password invaild');
            }
            
        } else {
            throw new Error('statusLogin is required!');
        }


    } catch (err) { res.status(500).json({ msg: err.message }) }

});



router.get('/checkUserLogin', (req, res) => {
    try {
        
        if (req.session.dataUser) {
            res.status(200).json({ val: req.session.dataUser, msg: 'Logingin'})
        } else {
            res.status(200).json({ val: null, msg: 'Not Logingin'})
        }

    } catch (err) { res.status(500).json({ msg: err.message }) }
});



module.exports = router; 