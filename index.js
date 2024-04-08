
const {getRandomId} = require('vk-io');
const express = require('express');
const http = require('http');
// Добавляем конфиг файл для хранения токена и подключаем библиотеку, которая облегчит работу с API ВК
const config = require("./config.json"), // конфиг файл
    { VK } = require('vk-io'), // сама библиотека
    { HearManager } = require('@vk-io/hear'), // Удобен для создания команд бота
	{webhookCallback} = require('grammy'),
	{chunk} = require('lodash');
// Теперь необходимо создать экземпляр класса передав в него наш токен для работы с API, в дальнейшем этот экземпляр понадобится нам для работы с библиотекой
const vk = new VK({
    token: config.token
});
if (process.env.NODE_ENV != "production"){
const command = new HearManager(); // Создаём экземпляр

vk.updates.on('message', command.middleware); // Это позволит HearManager прослушивать события сообщений
vk.updates.use(command.middleware);
// Получаем событие нового сообщения, также вы можете указывать полное название события (то как указано в документации вк, либо найти все сокращения в документации vk-io
vk.updates.on('message', async (context, next) => {
    console.log('Пришло новое сообщение!'); // Выводим в консоль сообщение о том, что пришло событие
    await next(); // Для продолжения выполнения кода нужно вызывать next функцию.
});

// Создадим прослушивателя команды /start и ответим пользователю после вызова команды
command.hear('/start', async (context) => {
    context.send(context);
	
})

command.hear('/myid', async (context) => {
    context.send(context.senderId);
	
})

command.hear('/sharePhoto', async (context) => {
    //console.log(context.attachments[0].largeSizeUrl);
	urls = '';
	if(context.attachments[0]){
		context.attachments.forEach((attachment) => {
			urls+='\n'+ attachment.largeSizeUrl;
		});
		
		context.send(urls);	
	}
})

command.hear('/shareFile', async (context) => {
    //console.log(context.attachments[0].url);
	urls = '';
	if(context.attachments[0]){
		context.attachments.forEach((attachment) => {
			urls+='\n'+ attachment.url;
		});
		
		context.send(urls);	
	}	
})

command.hear('/shareAudio', async (context) => {
    //console.log(context.attachments[0].url);
	urls = '';
	if(context.attachments[0]){
		context.attachments.forEach((attachment) => {
			urls+='\n'+ attachment.url;
		});
		
		context.send(urls);	
	}	
})

command.hear(/help/i, async (context) => {
    //console.log(context);
	context.send(config.help);
})
}
// function:
function getBody(request) {
  return new Promise((resolve) => {
    const bodyParts = [];
    let body;
    request.on('data', (chunk) => {
      bodyParts.push(chunk);
    }).on('end', () => {
      body = JSON.parse(Buffer.concat(bodyParts).toString('utf8'));
      resolve(body)
    });
  });
}

if (process.env.NODE_ENV === "production"){
  //console.log("prod");
  /*
  http.createServer(function (req, res) {
    console.log(`Just got a request at ${req.url}!`)
    res.write('cb9117fb');
    res.end();
}).listen(process.env.PORT || 3000);
	*/
   //vk.updates.start();
   
   
   vk.updates.start(
   { webhook: { path: '/vk-webhook',
				port: 3000,
				next: async (req, res) => {
					const body = await getBody(req);
					//console.log(req.method, req.url, req.headers, body);
					if(body.type === "message_new"){
						//console.log(body.type, body.object.message.text);
						const mes = body.object.message.text;
						ans = 'hello\n';
						if (mes==="help"){
							ans = config.help;
						}
						if(mes==="/shareFile"){
							body.object.message.attachments.forEach((attachment) => {
								ans+='\n'+ attachment[attachment.type].url;
								console.log(attachment[attachment.type].url);
							});
						}
						
						await vk.api.messages.send({
							user_id: body.object.message.from_id,
							message: ans,
							random_id: getRandomId()
						});
					}
					const headers = {
						connection: 'keep-alive',
						'content-type': 'text/plain',
						'Keep-Alive': 'timeout=5, max=10'
					};

					res.writeHead(200, headers);
					res.end('ok');
					//console.log(req); // Выводим в консоль сообщение о том, что пришло событие*
				}
			  } 
	}).then(() => console.log('Webhook server up!')).catch(console.log);
  //http.createServer(vk.updates.getWebhookCallback('/vk-webhook')).listen(process.env.PORT || 3000);
  
}else{
	//console.log(getRandomId());
	// Запускаем нашего бота и в случае ошибки выводим в консоль с помощью catch
vk.updates.start()
    .then(() => console.log('Бот запущен!'))
    .catch(console.error);
}


