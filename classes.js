class Queue
{
    constructor(connection, player, songs, yt)
    {
        this.connection = connection;
        this.player = player;
        this.songs = songs;
        this.yt = yt;
    }
}

module.exports = Queue;