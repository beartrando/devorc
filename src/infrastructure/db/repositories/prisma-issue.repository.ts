import {BattleStatus, PrismaClient} from "@prisma/client";

import BattleRepository from "../../../domain/battle/battle.repository";
import BattleEntity from "../../../domain/battle/battle.entity";
import BattleDbMapper from "../mappers/battle.mapper";
import BattleId from "../../../domain/battle/value-objects/battle-id.vo";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";

export class PrismaIssueRepository implements BattleRepository {

    constructor(
        private readonly prisma: PrismaClient,
    ) {
    }

    // async findById(
    //     id: BattleId,
    // ): Promise<BattleEntity | null> {
    //
    //     const battle = await this.prisma.battle.findUnique({
    //         where: {
    //             id: id.value,
    //         },
    //     });
    //
    //     if (!battle) {
    //         return null;
    //     }
    //
    //     return BattleDbMapper.toDomain(battle);
    // }
    //
    // async findByIds(
    //     ids: BattleId[],
    // ): Promise<BattleEntity[]> {
    //     if (ids.length === 0) {
    //         return [];
    //     }
    //
    //     const battles = await this.prisma.battle.findMany({
    //         where: {
    //             id: {
    //                 in: ids.map((id: BattleId) => id.value),
    //             },
    //         },
    //     });
    //
    //     return battles.map(BattleDbMapper.toDomain);
    // }
    //
    // async save(
    //     battle: BattleEntity,
    // ): Promise<BattleEntity> {
    //
    //     const battleDb = BattleDbMapper.toPersistence(battle);
    //     const {
    //         id,
    //         ...update
    //     } = battleDb;
    //
    //     // logger.log(battleDb);
    //     const result = await this.prisma.battle.upsert({
    //         where: {
    //             id: battleDb.id,
    //         },
    //         create: battleDb,
    //         update,
    //     });
    //
    //     return BattleDbMapper.toDomain(result);
    // }
    //
    // async findStale(
    //     since: Date,
    // ): Promise<BattleEntity[]> {
    //     const battles = await this.prisma.battle.findMany({
    //         where: {
    //             status: {
    //                 notIn: [
    //                     BattleStatus.Finished,
    //                     BattleStatus.Cancelled,
    //                     BattleStatus.TimeOut,
    //                 ],
    //             },
    //             updatedAt: {
    //                 lt: since,
    //             },
    //         },
    //         orderBy: {
    //             updatedAt: "asc",
    //         },
    //     });
    //
    //     return battles.map(BattleDbMapper.toDomain);
    // }
    //
    // async findCreatedByProfileId(
    //     profileId: ProfileId,
    // ): Promise<Set<BattleEntity> | null> {
    //
    //     const battles = await this.prisma.battle.findMany({
    //         where: {
    //             playerIds: {
    //                 has: profileId.value,
    //             },
    //             status: {
    //                 in: [
    //                     BattleStatus.Created,
    //                 ],
    //             },
    //         },
    //     });
    //
    //     if (battles.length === 0) {
    //         return null;
    //     }
    //
    //     return new Set(
    //         battles.map(BattleDbMapper.toDomain),
    //     );
    // }
    //
    //
    // async join(profileId: ProfileId, battleId: BattleId): Promise<BattleEntity | null> {
    //
    //     const updated = await this.prisma.battle.updateMany({
    //         where: {
    //             id: battleId.value,
    //             status: BattleStatus.Created,
    //         },
    //         data: {
    //             playerIds: {
    //                 push: profileId.value,
    //             },
    //             status: BattleStatus.Matched,
    //         },
    //     });
    //
    //     if (updated.count === 0) {
    //         return null;
    //     }
    //
    //     const battle = await this.prisma.battle.findUnique({
    //         where: {
    //             id: battleId.value,
    //         },
    //     });
    //
    //     if (!battle) {
    //         throw new Error("Battle disappeared after successful update.");
    //     }
    //
    //     return BattleDbMapper.toDomain(battle);
    // }
    //
    //
    // async findCreatedByProfile(battleId: BattleId, profileId: ProfileId): Promise<BattleEntity | null> {
    //
    //     const battle = await this.prisma.battle.findFirst({
    //         where: {
    //             status: BattleStatus.Created,
    //             playerIds: {
    //                 has: profileId.value,
    //             },
    //         },
    //     });
    //
    //     if (!battle) {
    //         return null;
    //     }
    //
    //     return BattleDbMapper.toDomain(battle);
    // }
    //
    // async findCreatedForProfile(profileId: ProfileId): Promise<BattleEntity | null> {
    //
    //     const battle = await this.prisma.battle.findFirst({
    //         where: {
    //             status: BattleStatus.Created,
    //             NOT: {
    //                 playerIds: {
    //                     has: profileId.value,
    //                 },
    //             },
    //         },
    //     });
    //
    //     if (!battle) {
    //         return null;
    //     }
    //
    //     return BattleDbMapper.toDomain(battle);
    // }
}

export default PrismaIssueRepository;
