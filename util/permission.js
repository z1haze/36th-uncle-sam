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

    const adminPermission = {
        id        : process.env.ADMIN_ROLE_ID,
        type      : 'ROLE',
        permission: true
    };

    commandManager.cache.each(async (command) => {
        switch (command.name) {
            case 'clear':
            case 'nickname':
            case 'transfer':
                await command.permissions.set({permissions: [ncoCorpPermission, officerCorePermission, adminPermission]});
                break;

            case 'promote':
            case 'demote':
            case 'reaction':
            case 'query':
                await command.permissions.set({permissions: [officerCorePermission, adminPermission]});
                break;

            case 'dm':
            case 'dump':
            case 'echo':
            case 'edit':
                await command.permissions.set({
                    permissions: [...process.env.TOP_TIER_ROLE_IDS.split(',')
                        .map((roleId) => {
                            return {
                                id        : roleId,
                                type      : 'ROLE',
                                permission: true
                            };
                        }), adminPermission]
                });
                break;
            case 'updatenicks':
                await command.permissions.set({
                    permissions: [{
                        id        : process.env.IT_SPECIALIST_ROLE_ID,
                        type      : 'ROLE',
                        permission: true
                    },
                    adminPermission]
                });
                break;
            case 'event':
                await command.permissions.set({
                    permissions: [
                        adminPermission,
                        ...process.env.TOP_TIER_ROLE_IDS.split(',')
                            .map((roleId) => {
                                return {
                                    id        : roleId,
                                    type      : 'ROLE',
                                    permission: true
                                };
                            }),
                        ...process.env.COMPANY_LEADERSHIP_ROLE_IDS.split(',')
                            .map((roleId) => {
                                return {
                                    id        : roleId,
                                    type      : 'ROLE',
                                    permission: true
                                };
                            }),
                        ...process.env.PLATOON_LEADERSHIP_ROLE_IDS.split(',')
                            .map((roleId) => {
                                return {
                                    id        : roleId,
                                    type      : 'ROLE',
                                    permission: true
                                };
                            })
                    ]
                });
                break;
        }
    });
};

module.exports = {
    setCommandsPermissions
};