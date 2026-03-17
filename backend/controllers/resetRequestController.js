import ResetRequest from '../models/ResetRequest.js';

// @desc    Create a reset request
// @route   POST /api/reset-requests
// @access  Public
export const createResetRequest = async (req, res) => {
    try {
        const { fullName, username, email, message } = req.body;
        if (!fullName || !username) {
            return res.status(400).json({ message: 'Fadlan geli magacaaga saddexan iyo username-ka' });
        }

        const request = await ResetRequest.create({
            fullName,
            username,
            email,
            message: message || `${fullName} wuxuu codsaday in loo reset gareeyo password-ka.`
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reset requests
// @route   GET /api/reset-requests
// @access  Private/Admin
export const getResetRequests = async (req, res) => {
    try {
        const requests = await ResetRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update reset request status
// @route   PUT /api/reset-requests/:id
// @access  Private/Admin
export const updateRequestStatus = async (req, res) => {
    try {
        const request = await ResetRequest.findById(req.params.id);
        if (request) {
            request.status = req.body.status || 'Resolved';
            const updatedRequest = await request.save();
            res.json(updatedRequest);
        } else {
            res.status(404).json({ message: 'Codsiga lama helin' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete reset request
// @route   DELETE /api/reset-requests/:id
// @access  Private/Admin
export const deleteResetRequest = async (req, res) => {
    try {
        const request = await ResetRequest.findById(req.params.id);
        if (request) {
            await request.deleteOne();
            res.json({ message: 'Codsiga waa la tirtiray' });
        } else {
            res.status(404).json({ message: 'Codsiga lama helin' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
