const TelegramBot = require("node-telegram-bot-api")
const requestPromise = require("request-promise")
const fs = require("fs")
const db = require("./db")
const newsG = require("./news")
let now = new Date();



const token = '1209355037:AAFzVNyTQ6seEgvYeQ2tGyQ5RpyejV3ftQI'
const bot = new TelegramBot(token, { polling: true })


bot.sendMessage(400034907, 'Я ожил хозяин');

const linkСurrency = "https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5"

//словари сопоставления вопросов и ответов через цифры 
const arrQWestions = JSON.parse(fs.readFileSync("questions_ru.json", "utf8"))
const arrAnswers = JSON.parse(fs.readFileSync("answers_ru.json", "utf8"))

const replacer = {
	"q": "й", "w": "ц", "e": "у", "r": "к", "t": "е", "y": "н", "u": "г",
	"i": "ш", "o": "щ", "p": "з", "[": "х", "]": "ъ", "a": "ф", "s": "ы",
	"d": "в", "f": "а", "g": "п", "h": "р", "j": "о", "k": "л", "l": "д",
	";": "ж", "'": "э", "z": "я", "x": "ч", "c": "с", "v": "м", "b": "и",
	"n": "т", "m": "ь", ",": "б", ".": "ю", "/": ".", " ": " "
}

let isEn = function (str) { return /[a-zA-Z]+$/i.test(str) }
function replaceLeng(str) {
	for (i = 0; i < str.length; i++) {
		if (replacer[str[i]] != undefined) {
			replace = replacer[str[i]]
			str = str.replace(str[i], replace)
		}
	}
	return str
}

//функция для работы напоминаний
// и отправки информации утром

// клавиатури для отправки локации 
//добавить выбор городов 
function GetGeo(msg) {
	bot.sendMessage(msg.from.id, "Для получения точной погоды нужны ваши кординаты", { 
		// создание клавиатуры на стороне пользователя
		reply_markup: {
			resize_keyboard: true, one_time_keyboard: true,
			keyboard: [[{ text: "отправить локацию", request_location: true }]]
		}
	})
}

//получаем погоду по апи 
async function Weather(msg) {
	let link = "https://api.openweathermap.org/data/2.5/onecall?lat=" + msg.location.latitude + "&lon=" + msg.location.longitude + "&exclude=hourly,daily&appid=64a63f6deaa92cc0b20582da006f74e2&lang=ru&units=metric"
	let answer = await requestPromise(link)
	resp = JSON.parse(answer)
	console.log(answer)
	console.log(resp)
	return (resp.current.weather[0].description + ", температура: " + resp.current.temp)
}

//получаем курс валют по апи 
async function Сurrency() {
	let answer = await requestPromise(linkСurrency)
	resp = JSON.parse(answer)
	console.log(answer)
	return ("USD покупка: " + resp[0].buy + "грн продажа: " + resp[0].sale + "грн \nEUR покупка: " + resp[1].buy + "грн продажа: " + resp[1].sale + "грн\nBTC покупка: " + resp[3].buy + "дол продажа: " + resp[3].sale + "дол")
}

//алгоритм прогоняющий сообщения для более точных совпадений
async function Conversation(qwestion, text) {
	if (qwestion == undefined) {
		wordsArr = text.split(" ")
		console.log(wordsArr)
		let qwestionNum = 100000000
		let answerMAT = "", answer
		for (let i = 0; i < wordsArr.length; i++) {
			let qwestion = arrQWestions[wordsArr[i]]
			console.log(qwestion)
			if (qwestion != undefined) {
				if (qwestion == 113) {
					console.log("worked")
					answerMAT = conw(qwestion)
					answerMAT = ", " + answerMAT
				}
				console.log(qwestion < qwestionNum)
				if (qwestion < qwestionNum && qwestion != 113) {
					qwestionNum = qwestion
					answer = conw(qwestion)

				}

			}
			console.log(answer)
		}
		return (answer + answerMAT)

	} else {
		answer = conw(qwestion)
		return answer
	}
}

// получаем рнд ответ со словаря 
function conw(qwestion) {
	let answerArrays = arrAnswers[qwestion]
	let rand = Math.floor(Math.random() * answerArrays.length);
	let answer = answerArrays[rand]
	return answer
}

// своеобразный роут 
bot.on('message', async function (msg) {
	console.log(msg)
	let answer
	let userId = msg.from.id;
	if (msg.location != undefined) {
		answer = await Weather(msg);
		bot.sendMessage(userId, answer)

	} else if (msg.text == "/start") {
		if (msg.chat.last_namel == undefined) { msg.chat.last_namel = null } else { msg.chat.last_namel = msg.chat.last_namel.toLowerCase() }
		db.sentStartDate(msg.chat.first_name.toLowerCase(), msg.chat.last_namel, msg.chat.id)
		
		var options = {
			reply_markup: JSON.stringify({
			  inline_keyboard: [
				[{ text: 'Погода', callback_data: '1' }],
				[{ text: 'Курс валют', callback_data: '2' }],
				[{ text: 'Новости', callback_data: '3' }]
			  ]
			})
		  }

		

		bot.sendMessage(userId, 'выбери что бы ты хотел знать утром (выбери несколько или однин вариант)',options)

	}else if(/^[0-9]{2}[.]{1}[0-9]{2}$/.test(msg.text)||/^[0-9]{1}[.]{1}[0-9]{2}$/.test(msg.text) ){
		db.sentDateTime(msg.text, msg.from.id)
		answer = "я запомнил время"
		bot.sendMessage(userId, answer)
	}
	else {
		let text = msg.text.toLowerCase()
		if (isEn(text)) {
			text = await replaceLeng(text)
		}
		let qwestion = arrQWestions[text]
		if (qwestion < 99) {
			console.log(qwestion)
			if (qwestion == 1) {
				let date = new Date();
				let now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
					date.getUTCHours(), date.getUTCMinutes());
				console.log(now_utc)
				answer = date.toString()
			}
			else if (qwestion == 2) answer = await Сurrency();
			else if (qwestion == 3) answer = await GetGeo(msg);
			else if (qwestion == 4) answer = await newsG.date
			console.log(answer)
			bot.sendMessage(userId, answer);
		}
		else {
			answer = await Conversation(qwestion, text)
			console.log(answer)
			if (answer == "undefined") answer = "Прости но я тебя не понимаю"
			bot.sendMessage(userId, answer)
			console.log(answer)
		}
	}
})

bot.on('callback_query', function (msg) {
	console.log(msg)
	let userId = msg.from.id;
	bot.sendMessage(userId, 'В котором часу тебе это присылать (пришли время в формате часы.минуты что бы получилось так: 7.24')
	db.sentDataKnow(msg.data,msg.from.id)
})

setInterval(async() => {
	let time = await db.getTime
		console.log(time)
	for (let i=0;i<10;i++){
		if(true){

		}
	}
	
}, 6000);