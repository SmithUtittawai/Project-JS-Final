const router = require('express').Router();
const stdModel = require('./../models/student');
const tecModel = require('./../models/teacher');
const courseModel = require('../models/course');


router.get('/getDataReport', async (req, res) => {
    
    // try {
        let tmpData = [];
        let indexTmp = 0;
        let stdInCourse = null;

        let findCouse = null;
        let findTec = await tecModel.findOne({_id: req.session.dataUser._id});
        let reg_course = findTec.tec_course;

        for (let item of reg_course) {
            
            findCouse = await courseModel.findOne({course_id: item.id});
            
            stdInCourse = await stdModel.find({
                std_course: {
                    $elemMatch: {
                        id: item.id,
                        sec: item.sec
                    }
                }
            })

            tmpData.push({
                course_id: item.id,
                course_name: findCouse.course_name,
                course_date: null,
                sec: item.sec,
                students: [],
                checkInDate: null,
                CancelClass: false,
                total: {
                    checkIn: 0,
                    absent: 0
                }
            });
            
            for (let std of stdInCourse) {
                tmpData[indexTmp].students.push({
                    id: std._id,
                    idSTD: std.std_id,
                    name: std.std_name,
                    statusCheckIn: false,
                });
            }

            for (let val of findCouse.course_section) {
                
                if (val !== null) {
                    
                    if (item.sec === val.sec) {
                        tmpData[indexTmp].course_date = val.time;

                        for (let checkIn of val.checkTime) {
                            
                            tmpData[indexTmp].checkInDate = checkIn.date;
                            tmpData[indexTmp].CancelClass = checkIn.status !== 1 ? true : false;

                            for (let std of tmpData[indexTmp].students) {
                                for (let idStd of checkIn.students) {
                                    if (idStd === std.id.toString().split('"')[0]) {
                                        std.statusCheckIn = true;
                                        tmpData[indexTmp].total.checkIn++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            console.log('tmpData[indexTmp]' , tmpData[indexTmp]);
            tmpData[indexTmp].total.absent = tmpData[indexTmp].students.length - tmpData[indexTmp].total.checkIn;

            indexTmp++;
        }

        res.status(200).json({val: tmpData, msg: 'success'});

    // } catch (err) { res.status(500).json({ msg: err.message }) }

});


router.get('/cancelClass/:course_id/:sec', async (req, res) => {
    
    try {

        let now = new Date();
        let findCourse = await courseModel.findOne({ course_id: req.params.course_id });
        console.log(findCourse);
        let findSec = findCourse.course_section.find(val => val.sec == parseInt(req.params.sec));
        let tmpSec = findCourse.course_section.find(val => val.sec != parseInt(req.params.sec));
        let tmpArr = [];

        try {
            
            for (let checkIn of findSec.checkTime) {
                let dateTime = new Date(checkIn.date);
                if (dateTime.getDate() === now.getDate() && dateTime.getMonth() === now.getMonth() && dateTime.getFullYear() === now.getFullYear()) {
                    checkIn.status = 0
                    break;
                }
            }
            tmpArr.push(findSec);
            tmpArr.push(tmpSec);
            let tmp_course_section = tmpArr;
            await courseModel.findOneAndUpdate({ course_id: req.params.course_id }, { course_section: tmp_course_section });

        } catch (err) { console.log(err) }

        res.status(200).json({ val: tmpArr }); 

    } catch (err) { res.status(500).json({ msg: err.message }); }

})


router.get('/createCheckIn/:course_id/:sec', async (req, res) => {

    // try {

        let now = new Date();
        let checkDuplicate = await courseModel.findOne({ course_id: req.params.course_id });
        let findSec = checkDuplicate.course_section.find(val => val.sec == parseInt(req.params.sec));
        let statusCreate = true;
        let checkTime = null

        // if (findSec.checkTime !== undefined || findSec.checkTime !== null || findSec.checkTime.length > 0) {
        //     for (let checkIn of findSec.checkTime) {
        //         if (checkIn) {
        //             let dateTime = new Date(checkIn.date);
        //             if (dateTime.getDate() === now.getDate() && dateTime.getMonth() === now.getMonth() && dateTime.getFullYear() === now.getFullYear()) {
        //                 checkTime = {
        //                     codeCheckIn: checkIn.code || 'error',
        //                     course_name: checkDuplicate.course_name, 
        //                     dateTime: findSec.time, 
        //                     sec: req.params.sec, 
        //                     checkDuplicate: checkDuplicate
        //                 };
        //                 console.log('checkTime', (checkTime || 'error'));
        //                 statusCreate = false;
        //                 break;
        //             }
        //         }
        //     }
        // }

        if (statusCreate) {

            let findCourse = await courseModel.findOne({course_id: req.params.course_id});

            if (findCourse.course_section.length > 0) {

                let sec = findCourse.course_section.find(val => val.sec == parseInt(req.params.sec));
                
                if (sec) {
                    let code = Math.random().toString(36).substring(2, 8).toUpperCase();
                    
                    let tmpCheckTime = {
                        "code": code,
                        "date": new Date(),
                        "students": [],
                        "status": 1
                    }
                    
                    for (let course of findCourse.course_section) {
                        if (!course.checkTime) {
                            course.checkTime = [];
                        }
                        if (course.sec == parseInt(req.params.sec)) {
                            course.checkTime.push(tmpCheckTime);
                        }
                    }

                    await courseModel.findOneAndUpdate({course_id: req.params.course_id}, {course_section: findCourse.course_section});

                    res.status(200).json({
                        val: { 
                            codeCheckIn: tmpCheckTime.code,
                            course_name: findCourse.course_name, 
                            dateTime: sec.time, 
                            sec: sec.sec, 
                            dataBeforeUpdate: findCourse 
                        },
                        msg: 'Check in created'
                    });
                
                } else {
                    throw new Error('Invalid section');
                }

            } else {
                throw new Error('Not found course!');
            }
        } else {
            res.status(200).json({ val: checkTime || 'error', msg: 'Check in today already created!'});
        }

    // } catch (err) { res.status(500).json({ msg: err.message }); }
        
});


router.get('/displayCourseTec', async (req, res) => {
    
    // try {
        console.log('req.session.dataUser.tec_course', req.session.dataUser.tec_course);
        let courseTeacher = req.session.dataUser.tec_course;
        
        let tmpCourse = null;
        let findCourse = [];
        for (let courseTec of courseTeacher) {
        
            tmpCourse = await courseModel.find({ course_id: courseTec.id });
            console.log('tmpCourse', tmpCourse);
            console.log('tmpCourse.course_section', tmpCourse.course_section);

            for (let course of tmpCourse) {
                for (let section of course.course_section) {
                    if (section !== null) {
                        if (section.sec === courseTec.sec) {
                            section.subject_ObjectID = course._id;
                            section.subject_id = course.course_id;
                            section.subject_name = course.course_name;
                            section.sec = courseTec.sec;
                            findCourse.push(section);
                        }
                    }
                }
            }

        }

        res.status(200).json({ val: findCourse, msg: 'data teacher course displayed' });


    // } catch (err) { res.status(500).json({ msg: err.message }); }

})


router.post('/insertTec', (req, res) => {
   
    try {
        
        let data = req.body;

        if (data.tec_name === '' || data.tec_id === '' || data.tec_pwd === '' || data.tec_course === null) {
            throw new Error('Please fill all field');
        }

        let user = null;
        if (typeof data === Array) {
            for (let val of data) {
                user = new tecModel(val);
                user.save();
            }
        } else {
            user = new tecModel(data);
            user.save();
        }

        res.status(200).json({ val: user, msg: 'inserted' });

    } catch (err) { res.status(500).json({ msg: err.message }) }

});



module.exports = router;