import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from '../../shared/logger.js';
import { getVersion } from '../file/packageJsonParse.js';
import { registerPackCodebaseTool } from './tools/packCodebaseTool.js';
import { registerPackRemoteRepositoryTool } from './tools/packRemoteRepositoryTool.js';

export const createMcpServer = async () => {
  const mcpServer = new McpServer({
    name: 'repomix-mcp-server',
    version: await getVersion(),
  });

  // Pack Codebase
  registerPackCodebaseTool(mcpServer);

  // Pack Remote Repository
  registerPackRemoteRepositoryTool(mcpServer);

  return mcpServer;
};

export const runMcpServer = async () => {
  const server = await createMcpServer();
  const transport = new StdioServerTransport();

  const handleExit = async () => {
    try {
      await server.close();
      logger.trace('Repomix MCP Server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during MCP server shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);

  try {
    await server.connect(transport);
    logger.trace('Repomix MCP Server running on stdio');
  } catch (error) {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  }
};
