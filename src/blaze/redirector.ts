import http from 'node:http'
import pino from 'pino'

const logger = pino({
  msgPrefix: '[Redirector] ',
  level: 'debug',
})

const blazePort: number = parseInt(process.env.BLAZE_PORT ?? "25565")

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<serverinstanceinfo>
  <address member="0">
      <valu>
          <hostname>${(process.env.HOSTNAME ?? "localhost")}</hostname>
          <ip>hello world</ip>
          <port>${blazePort}</port>
      </valu>
  </address>
  <secure>0</secure>
  <trialservicename></trialservicename>
  <defaultdnsaddress>0</defaultdnsaddress>
</serverinstanceinfo>`

const server = http.createServer((req, res) => {
  logger.debug('Redirected')

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/xml')
  res.end(xml)
})

server.listen(42230, () =>
  logger.info('Redirector started on port 42230')
)
