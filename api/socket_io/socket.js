
module.exports = {
    sockketIO: async (io) => {
        io.on("connection", async function (socket) {
            console.log('The user is connecting : ' + socket.id);
        })
    },
}