js_ltc_miner
============

A proof-of-concept LTC miner in javascript.

This proof of concept uses poolers JMiner codebase (https://github.com/pooler/JMiner) and ports it to Javascript. For demonstration purposes the data is hard coded in the 'work.js' file but by uncommenting the ajax call and adjusting the proxy.php file to point to your stratum server it can be run live. I did this to quickly overcome the cross-domain scripting issues - i.e. port 3333 is different from port 80 so javascript will throw a cross-domain exception if you try to make an ajax call to it.

Copy all the files into a web accessible directory and load the 'index.html' file then click on start to start hashing. It will update the hashrate, total hashes and display the latest hash every 200 hashes. I haven't run it long enough to actually find a share but I did confirm that the hashes match those of JMiner when the same data is fed so it seems to be working fine. The code to submit shares was not tested simply because I never ran the application long enough to find a share but it's there.

On my old laptop with an AMD Athod X2 processor I get about 40 hashes a second in Chrome and 30 hashes a second in Firefox! I used google CryptoJS (http://code.google.com/p/crypto-js/) library for the hashing functions and the JSON library from http://www.json.org/js.html for the JSON. I didn't bother with a library for the AJAX calls and I actually made the synchronous to make it simpler. 

I didn't port over every function from the JMiner codebase only those enough to get is hashing - for example I didn't do anything with longpolling or multiple threads or cpu throttling. I think they are all possible there just wasn't a need.

For those interested I made use of HTML5 workers to get the code hashing in the background and it communicates with the main javascript through messages. The only problem I ran into is that the worker threads hogs all the CPU resources and doesn't yield when a request is made - for example stop. My only attempt to get the worker to yield was to replace the while(running) { } loop with a setTimeout(work(), xxxx) but that hurt the hashrate alot.

Take it easy on me re: code style / coding etc...just a quick hack to get it hashing so I can see what could be expected.

If you find this useful please feel free to donate:

LTC: LRt1KkirdbiBf3vPQR3tEQZQrVxPAA9Bb4
