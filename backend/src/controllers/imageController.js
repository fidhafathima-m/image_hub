import Image from "../models/ImageSchema.js"
import path from "path";
import fs from "fs"

export const getImages = async(req, res) => {
    try {
        const images = await Image.find({ user: req.user._id }).sort({ order: 1, createdAt: -1 });

        res.json(images);
    } catch (error) {
        console.error("Get images error: ", error);
        res.status(500).json({error: "Server error"})
    }
}

export const uploadImage = async(req, res) => {
    try {
        const {title} = req.body;
        const file = req.file;

        if(!file) {
            return res.status(400).json({error: "No file uploaded"});
        }

        // Get highest order for this user
        const highestOrderImage = await Image.findOne({user: req.user._id}).sort({order: -1});

        const order = highestOrderImage ? highestOrderImage.order + 1: 0;

        const image = new Image({
            user: req.user._id,
            title,
            url: `/uploads/${file.filename}`,
            fileName: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            order
        });
        await image.save();
        res.status(201).json({message: "Image uploaded succwessfully", image})
    } catch (error) {
        console.error("Upload Image error: ", error);
        res.status(500).json({error: "Server error"})
    }
}

// bulk upload
export const bulkUploadImages = async(req, res) => {
    try {
        const {titles} = req.body;
        const files = req.files

        if(!files || files.length === 0) {
            return res.status(400).json({error: "No files uploaded"})
        }

        if (!titles || titles.length !== files.length) {
            return res.status(400).json({ error: 'Title count must match file count' });
        }

        // get highest order
        const highestOrderImage = await Image.findOne({user: req.user._id}).sort({order: -1});

        const order = highestOrderImage ? highestOrderImage.order + 1 : 0;

        const images = [];

        for(let i = 0; i < files.length; i++) {
            const file = files[i];
            const title = titles[i];

            const image = new Image({
                user: req.user._id,
                title,
                url: `/uploads/${file.filename}`,
                fileName: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                order
            })

            await image.save();
            images.push(image)
        }

        res.status(201).json({
            message: `${files.length} images uploaded`,
            images
        })
    } catch (error) {
        console.error("Bulk upload images error: ", error);
        res.status(500).json({error: "Server error"})
    }
}

// update image (title and/or name)
export const updateImage = async(req, res) => {
    try {
        const {id} = req.params;
        const {title} = req.body;
        const file = req.file;

        // find image
        const image = await Image.findOne({_id: id, user: req.user._id});

        if(!image) {
            return res.status(404).json({error: "Image not found"})
        }

        if(file) {
            const oldFilePath = path.join("uploads", image.fileName);
            if(fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath)
            }

            image.url = `/uploads/${file.filename}`;
            image.fileName = file.filename;
            image.originalName = file.originalname;
            image.size = file.size;
            image.memeType = file.mimetype
        }

        if(title) {
            image.title = title;
        }

        await image.save();
        
        res.json({
            message: "image updated successfully!",
            image
        })

    } catch (error) {
        console.error("update image error: ", error);
        res.status(500).json({error: "Server error"})
    }
}

// Delete image
export const deleteImage = async(req, res) => {
    try {
        const {id} = req.params;

        // find image
        const image = await Image.findOneAndDelete({_id: id, user: req.user._id});
        if(!image) {
            return res.status(404).json({error: "Image not found"})
        }

        // delete file from server
        const filePath = path.join(process.cwd(), "uploads", image.fileName);

        if(fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

        res.json({message: "Image deleted successfully!"})
    } catch (error) {
        console.error("Delete image error: ", error);
        res.status(500).json({error: "Server error"})
    }
}

// rearrange image order
export const rearrangeImages = async(req, res) => {
    try {
        const {imageOrder} = req.body

        if(!Array.isArray(imageOrder)) {
            return res.status(400).json({error: "Invalid image order array"})
        }

        // update order for each image
        const updatePromises = imageOrder.map((imageId, index) => {
            return Image.findOneAndUpdate(
                {_id: imageId, user: req.user._id}, 
                {order: index},
                {new: true}
            )
        })

        await Promise.all(updatePromises)
        res.json({message: "Images rearranged successfully"})
    } catch (error) {
        console.error("rearrange image error: ", error);
        res.status(500).json({error: "Server error"})
    }
}