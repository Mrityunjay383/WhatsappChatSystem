module.exports = async (io) => {
  const arr = Array.from(io.sockets.adapter.rooms);//getting map of current active rooms from socket

  let filtered = arr.filter(room => !room[1].has(room[0]))

  // //checking if some agent is already in the room
  // filtered = filtered.filter((i) => {
  //   return Array.from(i[1]).length === 1
  // })
  const rooms = filtered.map(i => i[0])

  return rooms;
}
