import CleaningChecklist from '../models/CleaningChecklist.js';

export const getCleaningChecklists = async (req, res) => {
    try {
        const checklists = await CleaningChecklist.find({}).sort({ date: -1 });
        res.json(checklists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching checklists' });
    }
};

export const createCleaningChecklist = async (req, res) => {
    try {
        const { staffName, date, sections, comments, supervisorName, suppliesStatus, suppliesNote, checkInTime, checkOutTime } = req.body;

        const checklist = await CleaningChecklist.create({
            staffName,
            date,
            sections,
            comments,
            supervisorName,
            suppliesStatus,
            suppliesNote,
            checkInTime,
            checkOutTime,
            createdBy: req.user._id,
        });

        res.status(201).json(checklist);
    } catch (error) {
        res.status(400).json({ message: 'Error creating checklist', error: error.message });
    }
};

export const deleteCleaningChecklist = async (req, res) => {
    try {
        const checklist = await CleaningChecklist.findById(req.params.id);
        if (checklist) {
            await checklist.deleteOne();
            res.json({ message: 'Checklist removed' });
        } else {
            res.status(404).json({ message: 'Checklist not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
