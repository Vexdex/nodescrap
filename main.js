/* 
 * ... License Headers ...
 */

var tress = require('tress'); // построитель очереди заданий
var needle = require('needle'); // HTTP client inder node для получения страницы сайта для скрапинга (парсинга)
var cheerio = require('cheerio'); // jQuery core for server
var resolve = require('url').resolve; // метод генерации URL из базового и ссылки
var fs = require('fs'); // подключение модуля файловой системы для записи данных и прочих файловых операций

var URL = 'http://localhost/nodescrap/doupage/index.html'; // исходная страница для скрапинга (ранее использован запароленный вход пользователя и сохранение всей страницы http://localhost/nodescrap/doupage/index.html локально)
var results = []; // заготовка для результата

// tress последовательно вызывает наш обработчик для каждой ссылки в очереди
var q = tress(function(url, callback){
        //тут мы обрабатываем страницу с адресом url
        needle.get(url, function(err, res){
            if (err) throw err;

            // можем проверить отклик res.statusCode WEB-сервера на HTTP-запрос         

            // здесь делаем парсинг страницы из res.body
            var $ = cheerio.load(res.body);

            // извлекаем данные о претенденте - имя и e-mail, заносим в массив results
            // здесь же будем запускать downloading файла с Резме, если таковой есть
            $('a.name').each(function(i, elem) {
                var str = $(this).text();
                // пополняем массив results, очищаем выходные данные от служебных \t\n
                results.push({
                    name: str.replace(/\n/g,"").replace(/\t/g,""),               
                    href: $(this).siblings('a[href^="mailto:"]').text()
                });
              });

            callback(); //вызываем callback в конце, т.е. добавляем задачу в очередь (если сделан q.push для следующих ссылок на обработку )
        }, 10); // запуск параллельного потока (до 10 потоков)
    });

// эта функция выполнится, когда в очереди закончатся ссылки
q.drain = function(){    
        fs.writeFileSync('./data.json', JSON.stringify(results, null, 4)); // запись файла data.json в JSON формате из массива results

        var stream = fs.createWriteStream("./data.csv"); // создание выходного потока записи в файл data.csv
        stream.once('open', function(fd) {
            for(record in results) {        
                stream.write(results[record].name + ";"+ results[record].href + "\r\n"); // чтение массива results и запись каждой строки в формате csv разделитель ; в выходной поток
            }
            stream.end(); // закрытие выходного потока
        });    
    };

// первый запуск - добавляем в очередь ссылку на первую страницу списка 
q.push(URL);