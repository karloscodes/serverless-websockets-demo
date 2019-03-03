# serverless-websockets-demo
A simple chat using websockets, serverless and aws lambda

## Getting started:
- Install serverless framework 1.38 or superior
- run ```sls deploy```
- Use a websocket client such as [wscat](https://www.npmjs.com/package/wscat) to connect and send messages

## Connection and protocol details:
  - First user setup:
  ```wscat -c wss://<my-api-id>.execute-api.us-east-1.amazonaws.com/dev?userId=1```
  - Second user setup:
  ```wscat -c wss://<my-api-id>.execute-api.us-east-1.amazonaws.com/dev?userId=2```
  
  - Send messages:
  ```{"action":"sendMessage","userId": "2","body":"hello!"}```
