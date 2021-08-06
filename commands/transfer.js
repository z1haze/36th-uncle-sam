const {isValidCompanyRole, isValidPlatoonRole, isValidSquadRole, getMemberCompanyRole, getMemberPlatoonRole, getMemberSquadRole, getDividerRole} = require('../util/role');
const {isRecruit, isMember, updateNickname} = require('../util/user');

module.exports = (interaction) => {
    const member = interaction.options.getMember('member');
    const company = interaction.options.getRole('company');
    const platoon = interaction.options.getRole('platoon');
    const squad = interaction.options.getRole('squad');

    if (!member.manageable) {
        return interaction.reply({
            content  : `${member} cannot be managed.`,
            ephemeral: true
        });
    }

    if (!isMember(member) && !isRecruit(member)) {
        return interaction.reply({
            content  : `Transfer failed. ${member} is not a member`,
            ephemeral: true
        });
    }

    /**
     * Make sure before we do anything that the roles being requested
     * are valid to their respective fields
     */
    try {
        if (!isValidCompanyRole(member.guild, company)) {
            throw new Error(`${company.name} is not a valid company.`);
        }

        if (!isValidPlatoonRole(member.guild, platoon)) {
            throw new Error(`${platoon.name} is not a valid platoon.`);
        }

        if (!isValidSquadRole(member.guild, squad)) {
            throw new Error(`${squad.name} is not a valid squad.`);
        }
    } catch (e) {
        return interaction.reply({
            content  : e.message,
            ephemeral: true
        });
    }

    /**
     * Make sure that the company, platoon, and squad all align with each other
     * eg Bravo company, needs a bravo platoon, and a squad that belongs to said platoon
     */
    try {
        // make sure that the company, platoon, and squad belong together
        // eg Bravo Company, Bravo 1st Platoon, and 1/1 BCo
        const companyName = company.name.substring(0, company.name.indexOf(' '));

        // make sure the platoon belongs to this company
        if (platoon.name.indexOf(companyName) !== 0) {
            throw new Error(`${platoon.name} is not part of ${company.name}`);
        }

        // Make sure the squad belongs to this company
        if (!squad.name.includes(companyName.substr(0, 1) + 'Co')) {
            throw new Error(`${squad.name} is not part of ${company.name}`);
        }

        // make sure the squad belongs to this platoon
        const platoonNumber = squad.name.match(/^\d\/(\d)/)[1];
        const pattern = new RegExp(String.raw`${platoonNumber}\w{2}`);
        const match = platoon.name.match(pattern);

        if (!match.length) {
            throw new Error(`${squad.name} is not part of ${platoonNumber.name}`);
        }
    } catch (e) {
        return interaction.reply({
            content  : e.message,
            ephemeral: true
        });
    }

    interaction.defer({ephemeral: true})
        .then(async () => {
            let dividerRole = getDividerRole(member.guild, 'COMPANY');

            if (!member.roles.cache.has(dividerRole.id)) {
                await member.roles.add(dividerRole);
            }

            dividerRole = getDividerRole(member.guild, 'PLATOON');

            if (!member.roles.cache.has(dividerRole.id)) {
                await member.roles.add(dividerRole);
            }

            dividerRole = getDividerRole(member.guild, 'SQUAD');

            if (!member.roles.cache.has(dividerRole.id)) {
                await member.roles.add(dividerRole);
            }

            try {
                await transferRole(member, 'COMPANY', company);
                await transferRole(member, 'PLATOON', platoon);
                await transferRole(member, 'SQUAD', squad);
                await updateNickname(member);
            } catch (e) {
                return interaction.editReply(e.message);
            }

            return interaction.editReply(`${member}'s transfer has been completed.`);
        });

    /**
     * Do the following:
     * 1. find existing role matching the identifier
     * 2. add divider role if necessary
     * 3. remove existing role
     * 4. add new role
     *
     * @param guildMember {GuildMember}
     * @param identifier {String}
     * @param newRole {Role}
     * @returns {Promise<void>}
     */
    async function transferRole (guildMember, identifier, newRole) {
        // the role we will be swapping out
        let existingRole = null;

        // fetch the existing member role based on the identifier
        switch (identifier) {
            case 'COMPANY':
                existingRole = getMemberCompanyRole(guildMember);
                break;
            case 'PLATOON':
                existingRole = getMemberPlatoonRole(guildMember);
                break;
            case 'SQUAD':
                existingRole = getMemberSquadRole(guildMember);
                break;
            default:
                throw new Error('You did some invalid shit');
        }

        // only remove the existing role if its not the same as the new role
        if (existingRole) {
            if (newRole.id !== existingRole.id) {
                await guildMember.roles.remove(existingRole);
            }
        }

        // only add a new role if it isnt the same as the existing role
        if (!existingRole || existingRole.id !== newRole.id) {
            await guildMember.roles.add(newRole);
        }
    }
};