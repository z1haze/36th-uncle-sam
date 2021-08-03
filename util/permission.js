const setCommandsPermissions = async (commandManager) => {
    commandManager.cache.each((command) => {
        switch (command.name) {
            case 'clear': {
                break;
            }

            case 'dm': {
                break;
            }

            case 'dump': {
                break;
            }

            case 'echo': {
                break;
            }

            case 'edit': {
                break;
            }

            case 'nickname': {
                break;
            }

            case 'promote': {
                break;
            }

            case 'query': {
                break;
            }

            case 'reaction': {
                break;
            }

            case 'transfer': {
                break;
            }
        }
    });
};

module.exports = {
    setCommandsPermissions
};