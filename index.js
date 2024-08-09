import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mysql from 'mysql';

const app = express();

// CORS configuration
const corsOptions = {
    origin: 'https://ameer-blog-tiers.netlify.app',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));

// Middleware to handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Serve static files from the 'public' directory
app.use('/images', express.static('public/images'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    },
});

app.get('/', (req, res) => {
    res.send("hi");
});

const upload = multer({ storage });

// MySQL connection
const connection = mysql.createConnection({
    host: "bung90wkahsixyvpwgft-mysql.services.clever-cloud.com",
    user: "umvgxcmdutuolmm5",
    password: "OxBzzfbw2uWJZibQ7ZLY",
    database: "bung90wkahsixyvpwgft",
    port: "3306",
});

connection.connect((err) => {
    if (err) {
        console.log("error in connecting database ", err);
        return err;
    }
    console.log("Database Connected");
});

app.post('/uploadBlog', upload.single('image'), (req, res) => {
    try {
        const file = req.file ? req.file.filename : null;
        const title = req.body.title;
        const content = req.body.content;

        const data = {
            image: file,
            title: title,
            content: content
        };

        connection.query("INSERT into blog SET ?", data, (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Failed to insert data" });
            }
            const imageUrl = file ? `http://localhost:3000/images/${file}` : null;
            return res.status(200).send({
                success: true,
                message: "Data inserted successfully",
                imageUrl: imageUrl
            });
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to upload blog' });
    }
});

app.get("/getBlogs", async (req, res) => {
    try {
        connection.query("SELECT * from blog", (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Failed to retrieve blogs" });
            }
            res.json({ results });
        });
    } catch (error) {
        return res.status(500).send({ error: "An error occurred while fetching blogs" });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
