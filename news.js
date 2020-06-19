const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('9b782ba4a0e64cb29533f820af9fb980');

let news
let listNews = ""

 newsapi.v2.topHeadlines ({
    category: 'technology',
      language: 'ua',
      country: 'ua'
  }).then(response => {
    news = response
    
    for(let i =0; i<10; i++){
      listNews+=news.articles[i].title+"\n"+news.articles[i].url+"\n\n"
    }module.exports.date = listNews
})

