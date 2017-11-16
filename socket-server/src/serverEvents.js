/**
 *
 *  Server emissions
 *
 */
export const serverInitialState = ({ client, room }) => {
  client.emit('server.initialState', {
    id: client.id,
    text: room.get('text'),
  });
};

export const serverChanged = ({ io, room }) => {
  const roomId = room.get('id');
  const text = room.get('text');
  io
    .in(roomId)
    .emit('server.changed', { text });
};

export const serverHighlight = ({ io, room }) => {
  const roomId = room.get('id');
  const highlight = room.get('highlight');
  io
    .to(roomId)
    .emit('server.highlight', { highlight });
};

export const serverLeave = ({ io, room }) => {
  io
    .in(room.get('id'))
    .emit('server.leave');
};

export const serverRun = ({ io, room }, stdout) => {
  io
    .in(room.get('id'))
    .emit('server.run', { stdout });
};

export const serverMessage = ({ io, room }, message) => {
  io
    .in(room.get('id'))
    .emit('server.message', message);
};