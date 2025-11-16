
upload_mcp:
	scp -r ./mcp piotr@100.96.46.43:/home/piotr 

upload_mcp_server:
	scp -r ./mcp/server.js  piotr@100.96.46.43:/home/piotr/mcp