import axios from 'axios';

import log from './lib/log';
import {
  serverInitialState,
  serverChanged,
  serverLeave,
  serverRun,
  serverMessage,
  serverHighlight,
} from './serverEvents';

/**
 *
 *  Client emissions (server listeners)
 *
 *  more on socket emissions:
 *  @url {https://socket.io/docs/emit-cheatsheet/}
 *
 *  @param room is an ES6 Map, containing { id, state }
 *  @url {https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map}
 *
 */
const clientReady = ({ io, client, room }) => {
  log('client ready heard, io is, ', io, 'client is, ', client, 'room is, ', room);
  serverInitialState({ io, client, room });
};

const clientUpdate = ({ io, client, room }, payload) => {
  log('client update heard. payload.text = ', payload.text);
  room.set('text', payload.text);
  serverChanged({ io, client, room });
};

// const clientHighlight = ({ io, client, room}, payload) => {
//   log('client update heard. payload = ', payload.highlight)
//   room.set('highlight', payload.highlight);
//   serverHighlight({ io, client, room })
// }

const clientDisconnect = ({ io, room }) => {
  log('client disconnected');
  serverLeave({ io, room });
};

const clientRun = async ({ io, room }) => {
  log('running code from client. room.get("text") = ', room.get('text'));

  const url = process.env.CODERUNNER_SERVICE_URL;
  const code = room.get('text');

  try {
    const { data } = await axios.post(`${url}/submit-code`, { code });
    const stdout = data;
    serverRun({ io, room }, stdout);
  } catch (e) {
    log('error posting to coderunner service from socket server. e = ', e);
  }
};

const clientMessage = ({ io, room }, payload) => {
  log('client message heard');
  serverMessage({ io, room }, payload);
};

const clientEmitters = {
  'client.ready': clientReady,
  'client.update': clientUpdate,
  'client.disconnect': clientDisconnect,
  'client.run': clientRun,
  'client.message': clientMessage,
  // 'client.highlight': clientHighlight
};

export default clientEmitters;
