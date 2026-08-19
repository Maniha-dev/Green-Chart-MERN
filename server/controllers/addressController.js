import Address from '../models/Address.js';

// Add Address: /api/address/add
export const addAddress = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        const address = req.body?.address;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized',
            });
        }

        if (!address || typeof address !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Address data is required.',
            });
        }

        const requiredFields = [
            'firstName',
            'lastName',
            'email',
            'street',
            'city',
            'state',
            'zipcode',
            'country',
            'phone',
        ];

        const missingField = requiredFields.find(
            (field) => address[field] === undefined || address[field] === ''
        );

        if (missingField) {
            return res.status(400).json({
                success: false,
                message: `${missingField} is required.`,
            });
        }

        const savedAddress = await Address.create({
            ...address,
            userId,
            zipcode: Number(address.zipcode),
        });

        return res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address: savedAddress,
        });
    } catch (error) {
        console.error('Add address failed:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Address: /api/address/get
export const getAddress = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized',
            });
        }

        const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            addresses,
        });
    } catch (error) {
        console.error('Get addresses failed:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
