# powerplay

Bot de música para o Discord.

## Como configurar

Crie uma aplicação no [Discord Developer Portal](https://discord.com/developers/applications) e pegue o Token e o Client ID do seu bot.

Crie um arquivo .env com as seguintes variáveis:  

```env
TOKEN="###"  
CLIENTID="0000000000000000000"
SYSTEM_FFMPEG="TRUE"
```

Substitua o Token e o Client ID pelos do seu bot.
Se for utilizar o seu próprio ffmpeg ao invés do ffmpeg-static, coloque SYSTEM_FFMPEG="TRUE". Se não, coloque "FALSE".

Se estiver no Linux, instale o ffmpeg utilizando o gerenciador de pacotes da sua preferência e configure a variável de ambiente acima. Ex.:
```shell
sudo apt install ffmpeg
```

Depois, abra o terminal da sua preferência e execute os seguinte comandos:
```shell
npm install
npm run deploy
npm start
```
