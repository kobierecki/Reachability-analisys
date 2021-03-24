import { RESULT_HANDLER } from '../actions/actions'

const handlerMessage = {
  NO_GEOCODE_RESULTS:
    'Przykro mi, nie można odnaleźć lokalizacji pod podanym adresem.',
  NO_ISOCHRONES_RESULTS:
    'Przykro mi, nie można oszacować izochrony dla wybranej lokalizacji.'
}

const handlerTopic = {
  NO_GEOCODE_RESULTS: 'Nie mogę odnaleźć adresu',
  NO_ISOCHRONES_RESULTS: 'Nie mogę zbudować izochrony dla tej lokalizacji',
  INVALID_CREDENTIALS:
    'Twoje dane są nieprawidłowe.'
}

const initialState = {
  handlerCode: null,
  handlerMessage: null,
  handlerTopic: null,
  receivedAt: null
}

const resultHandler = (state = initialState, action) => {
  console.log(action)
  switch (action.type) {
    case RESULT_HANDLER:
      return {
        ...state,
        handlerCode: action.handlerCode,
        handlerTopic: handlerTopic[action.handlerCode],
        handlerMessage: action.handlerMessage
          ? action.handlerMessage
          : handlerMessage[action.handlerCode],
        receivedAt: action.receivedAt
      }
    default:
      return state
  }
}

export default resultHandler
