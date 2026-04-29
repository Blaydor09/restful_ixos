# Guia de pruebas en servidor con PM2

Esta guia esta pensada para cuando la API ya esta desplegada y corriendo con PM2 en un servidor.

Para el detalle completo de rutas, revisa [GUIA_POSTMAN.md].

## 1. Objetivo

Hacer pruebas desde el servidor para confirmar 3 cosas:

1. La API esta viva dentro del servidor.
2. PM2 la esta ejecutando correctamente.
3. La API responde bien tanto por `localhost` como por la URL publica.

## 2. Datos que debes tener a mano

Antes de empezar, define estos valores:

- `APP_PM2`: nombre del proceso en PM2.
- `PORT`: puerto real de la API. Si no lo cambiaste, normalmente es `3000`.
- `BASE_LOCAL`: normalmente `http://127.0.0.1:3000`
- `BASE_PUBLIC`: tu dominio o IP publica, por ejemplo `https://api.midominio.com`

## 3. Verificar que PM2 esta corriendo

Conectate por SSH al servidor y ejecuta:

```bash
pm2 list
```

Debes ver tu proceso en estado `online`.

Para ver mas detalle:

```bash
pm2 show <APP_PM2>
```

Para ver logs recientes:

```bash
pm2 logs <APP_PM2> --lines 100
```

## 4. Smoke test basico dentro del servidor

Primero prueba directo contra la API por `localhost`. Esto sirve para validar la app sin depender de Nginx, dominio, SSL o firewall.

```bash
curl -i http://127.0.0.1:3000/
curl -i http://127.0.0.1:3000/health
```

Lo esperado:

- `GET /` debe responder `200`.
- `GET /health` debe responder `200` con un JSON parecido a `{ "status": "ok", "timestamp": "..." }`.

Si esto falla, el problema esta en la app o en PM2, no en el proxy.

## 5. Smoke test por URL publica

Luego prueba por la URL externa:

```bash
curl -i https://api.midominio.com/
curl -i https://api.midominio.com/health
```

Si `localhost` responde bien pero la URL publica falla:

- revisa Nginx o el reverse proxy
- revisa el certificado SSL
- revisa puertos abiertos en firewall
- revisa si el proxy esta apuntando al puerto correcto

## 6. Flujo minimo de prueba funcional

La API tiene este detalle importante:

- `POST /api/v1/auth/register` crea usuario, pero actualmente no devuelve tokens
- despues de registrar, debes hacer `login`

### 6.1 Crear un usuario de prueba

Usa datos unicos para no chocar con usuarios existentes:

```bash
TS=$(date +%s)
USER_NAME="test$TS"
EMAIL="test$TS@example.com"
PASSWORD="Secret1234"
```

Registro:

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USER_NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"displayName\":\"Usuario Prueba\"}"
```

Debe responder `201`.

### 6.2 Hacer login

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
```

Debe responder `200` y devolver:

- `accessToken`
- `refreshToken`
- `user`

## 7. Probar rutas protegidas

Toma el `accessToken` del login y usalo asi:

```bash
curl -i http://127.0.0.1:3000/api/v1/me/profile \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

Tambien conviene probar estas:

```bash
curl -i http://127.0.0.1:3000/api/v1/me/preferences \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"

curl -i http://127.0.0.1:3000/api/v1/me/likes \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"

curl -i http://127.0.0.1:3000/api/v1/me/player-state \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

## 8. Probar rutas publicas importantes

Estas rutas sirven como validacion rapida del catalogo:

```bash
curl -i http://127.0.0.1:3000/api/v1/catalog/home
curl -i http://127.0.0.1:3000/api/v1/catalog/songs
curl -i "http://127.0.0.1:3000/api/v1/search?q=rock"
curl -i http://127.0.0.1:3000/api/v1/playlists
```

## 9. Probar refresh token

Cuando ya tengas `refreshToken`, prueba:

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"TU_REFRESH_TOKEN"}'
```

Debe responder `200` con un nuevo `accessToken` y un nuevo `refreshToken`.

## 10. Probar logout

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"TU_REFRESH_TOKEN"}'
```

Debe responder `204`.

## 11. Prueba recomendada desde Postman usando el servidor

Si quieres probar desde tu maquina local contra el servidor ya desplegado:

1. Crea un environment nuevo en Postman.
2. Define `baseUrl = https://api.midominio.com`
3. Define `accessToken` y `refreshToken` despues del login.
4. Ejecuta en este orden:
   - `GET {{baseUrl}}/health`
   - `POST {{baseUrl}}/api/v1/auth/register`
   - `POST {{baseUrl}}/api/v1/auth/login`
   - `GET {{baseUrl}}/api/v1/catalog/home`
   - `GET {{baseUrl}}/api/v1/me/profile`
   - `GET {{baseUrl}}/api/v1/me/preferences`

## 12. Si falla algo, como aislar el problema

### Caso A: falla `localhost` y falla URL publica

Probable causa:

- PM2 no levanto bien la app
- variables de entorno incorrectas
- error de conexion a PostgreSQL
- app caida al iniciar

Revisa:

```bash
pm2 logs <APP_PM2> --lines 200
pm2 show <APP_PM2>
```

### Caso B: `localhost` funciona pero URL publica falla

Probable causa:

- Nginx mal configurado
- SSL vencido o mal configurado
- firewall o security group
- el proxy apunta a otro puerto

Revisa el reverse proxy y prueba otra vez:

```bash
curl -i http://127.0.0.1:3000/health
curl -i https://api.midominio.com/health
```

### Caso C: login funciona pero rutas protegidas dan `401`

Probable causa:

- token copiado incompleto
- header mal formado
- se envio sin `Bearer `
- el token ya expiro

Ejemplo correcto:

```bash
curl -i http://127.0.0.1:3000/api/v1/me/profile \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### Caso D: `400` en rutas con body

Probable causa:

- JSON invalido
- faltan campos obligatorios
- UUID mal formado

Esta API valida con Zod, asi que suele devolver detalle en el body del error.

## 13. Checklist corto de validacion en produccion

- `pm2 list` muestra el proceso `online`
- `GET /health` responde `200` por `localhost`
- `GET /health` responde `200` por dominio publico
- `register` responde `201`
- `login` responde `200`
- una ruta protegida responde `200` con Bearer token
- `refresh` responde `200`
- `logout` responde `204`

## 14. Comandos utiles de soporte

Reiniciar la app:

```bash
pm2 restart <APP_PM2>
```

Ver solo el estado:

```bash
pm2 status
```

Guardar procesos PM2:

```bash
pm2 save
```

## 15. Recomendacion practica

Cuando hagas pruebas en servidor, hazlas en este orden:

1. `localhost`
2. URL publica
3. auth
4. rutas protegidas
5. refresh y logout

Ese orden te ayuda a detectar rapido si el problema es de aplicacion, PM2, base de datos o proxy.
