const http = require('http');
const express = require('express');
const app = express();
const templateEngine = require('express-es6-template-engine');
const { json } = require('node:stream/consumers');
app.engine('html', templateEngine);
app.set('views', 'templates');
app.set('view engine', 'html');
// const pgp = require('pg-promise');
// const pgPromise = pgp();
// const dbConnection = pgPromise('postgres://postgres:RositaAcres6214!@localhost:5432/postgres')
const { Sequelize, DataTypes } = require('sequelize');

const sequelizeConnection = new Sequelize('postgres://postgres:RositaAcres6214!@localhost:5432/postgres', {
    define: {
        timestamps: false,
        schema: 'project_2'
    }
})



const taskBoard = sequelizeConnection.define('taskboards', {
    taskBoardId: {
        type: DataTypes.INTEGER,
        field: 'taskboard_id',
        primaryKey: true
    },
    taskBoardOwner: {
        type: DataTypes.STRING,
        field: 'taskboard_user',
    }
})

const taskTable = sequelizeConnection.define('tasks', {
    taskId: {
        type: DataTypes.INTEGER,
        field: 'task_id',
        autoIncrement: true,
        primaryKey: true
    },
    taskName: {
        type: DataTypes.STRING,
        field: 'task_name'
    },
    taskDescription: {
        type: DataTypes.STRING,
        field: 'task_description'
    },
    taskDueDate: {
        type: DataTypes.DATE,
        field: 'task_duedate'
    },
    taskBoardId: {
        type: DataTypes.INTEGER,
        field: 'taskboard_id'
    }
})



sequelizeConnection.authenticate().then(() => {
    console.log('db connection successful')
}).catch((error) => {
    console.log(error);
})

sequelizeConnection.sync().then(() => {
    console.log('Tables created successfully')
})

//middleware functions
app.use(express.static(__dirname + '/public')) // make another one for main.js
app.use(express.json())


//GET request for blank taskmanager
app.get('/taskmanagerhome', (req, res) => {
    res.render('homepage.html'
    )
})

//GET request for taskmanager with current taskboard divs/notes form tasks table
app.get('/taskboardhome', (req, res) => {
    taskTable.findAll().then((taskNote) => {
        console.log(taskNote)
        res.send(taskNote)
    })
}
)

//GET request that will take us to the current task clicked on the taskboard
app.get('/taskmanager/:currenttask', (req, res) => {
    const updateCurrentId = req.params['currenttask'];
    const currentData = req.body;
    taskTable.findByPk(updateCurrentId).then((currentTask) => {
        if (updateCurrentId) {
            res.json(currentTask)
            console.log(currentTask)
        } else {
            res.status(404).send('task not found')
        }
    })
})


// app.get('/taskboard', (req, res)=>{
//     taskBoard.findOne().then((taskBoardOwner)=>{
//         res.send(taskBoardOwner)
//     })
// })



//POST request that will add the new task to the tasks table
app.post('/taskboardhome', (req, res) => {
    taskTable.create({
        taskName: req.body.taskName, taskDescription: req.body.taskDescription,
        taskDueDate: req.body.taskDueDate, taskBoardId: req.body.taskBoardId
    })
        .catch((err) => {
            console.error('error creating task:', err)
        }).then((result)=>{
            console.dir(result)
            res.json(result)
        }
        )
})


//put request that will update the task user name in the taskboard table
app.put('/taskmanagerhome', (req, res) => {
    taskBoard.findOne().then((myTaskBoard) => {
        if (!myTaskBoard) {
            taskBoard.create({ // .create creates a new record and everything inside is the different field names for table with their values
                taskBoardId: 1, taskBoardOwner: req.body.taskBoardOwner
            })
        } else {
            taskBoard.update({ //if the taskboard exists - update the name of the taskowner 
                taskBoardOwner: req.body.taskBoardOwner
            }, {
                where: { taskboard_id: 1 } // have to have where so it knows which one to update
            })
        }
    })
    console.dir(req.body)
    res.sendStatus(201);
})

//updates the current task table
app.put('/taskmanager/:currenttask', (req, res) => {
    const updateCurrentId = req.params['currenttask'];
    const currentData = req.body;
    taskTable.findByPk(updateCurrentId).then((currentTaskItem) => {
        if (currentTaskItem) {
            currentTask.create({
                currentTaskId: updateCurrentId.currentTaskId, currentTaskName: currentData.currentTaskName, currentTaskDescription: currentData.currentTaskDescription,
                currentTaskDueDate: currentData.currentTaskDueDate, currentTaskBoardId: 1
            })
                // } else {
                //     currentTask.update({
                //         currentTaskId: updateCurrentId.currentTaskId, currentTaskName: currentData.currentTaskName, currentTaskDescription: currentData.currentTaskDescription,
                //         currentTaskDueDate: currentData.currentTaskDueDate, currentTaskBoardId: 1
                //     })
                .catch((err) => {
                    console.error('this is error', err)
                })
                .then(
                    res.send('updated')
                )
        }

    })

})



//DELETE request that will delete the current task from the UI, the task table, and the taskboard
app.delete('/taskmanager/:currenttask', (req, res) => {
     const updateCurrentId = req.params['currenttask'];
     taskTable.destroy({
        where: { taskId: updateCurrentId }
    })
    res.status(200).send('Book deleted successfully')
})

// app.get('/taskmanager-current-task' (req, res)=>{

// })


// app.post('/taskmanager-update-taskboard', (req, res)=>{

//     dbConnection.one('Insert into project_2.taskboard(taskboard_id), values($1)',
//     [taskInfo.taskBoardId])
//     res.status(201).send('book added')
// })




const server = http.createServer(app);
server.listen(3000, '127.0.0.1', () => {
    console.log('server started sister')
})