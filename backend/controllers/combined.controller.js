const awbtopdfMiddleware = require("../middlewares/awbtopdf.middleware");

exports.combinedController = async (req, res) => {
    try {
        // Assuming req.body contains the array of AWB numbers
        // You can also validate req.body here

        // Call the middleware passing the array of AWB numbers
        const { successfulDownloads, failedDownloads } = await awbtopdfMiddleware(req, res, () => { });

        // Send a response indicating successful PDF creation
        res.status(200).json({
            message: 'PDFs created successfully.',
            successfulDownloads,
            failedDownloads
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};
