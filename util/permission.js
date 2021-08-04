const setCommandsPermissions = async (commandManager) => {
    const ncoCorpPermission = {
        id        : process.env.NCO_CORP_ROLE_ID,
        type      : 'ROLE',
        permission: true
    };

    const officerCorePermission = {
        id        : process.env.OFFICER_CORP_ROLE_ID,
        type      : 'ROLE',
        permission: true
    };

    commandManager.cache.each(async (command) => {
        switch (command.name) {
            case 'clear':
            case 'nickname':
            case 'transfer':
                await command.permissions.set({permissions: [ncoCorpPermission, officerCorePermission]});
                break;

            case 'dm':
            case 'promote':
            case 'reaction':
            case 'query':
                await command.permissions.set({permissions: [officerCorePermission]});
                break;

            case 'dump':
            case 'echo':
            case 'edit':
                await command.permissions.set({
                    permissions: process.env.TOP_TIER_ROLE_IDS.split(',')
                        .map((roleId) => {
                            return {
                                id        : roleId,
                                type      : 'ROLE',
                                permission: true
                            };
                        })
                });
        }
    });
};

module.exports = {
    setCommandsPermissions
};