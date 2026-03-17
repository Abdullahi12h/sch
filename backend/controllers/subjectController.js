import Subject from '../models/Subject.js';

export const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({});
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addSubject = async (req, res) => {
    try {
        const { name, status } = req.body;
        
        const subjectExists = await Subject.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject already exists' });
        }

        const subject = await Subject.create({ name, status });
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSubject = async (req, res) => {
    try {
        const { name, status } = req.body;
        const subject = await Subject.findById(req.params.id);
        if (subject) {
            subject.name = name || subject.name;
            subject.status = status || subject.status;
            const updatedSubject = await subject.save();
            res.json(updatedSubject);
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (subject) {
            await subject.deleteOne();
            res.json({ message: 'Subject removed' });
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
