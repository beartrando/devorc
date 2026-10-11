import ProjectId from "../project/value-objects/project-id.vo";
import PullRequestId from "../pull-request/value-objects/pull-requet-id.vo";
import RepositoryId from "../repository/value-objects/repository-id.vo";


export type IssueEntityProps = {
    id: IssueIdId;
    projectIds: ProjectId[];
    pullRequestIds: PullRequestId[];
    repositoryIds: RepositoryId[];
};

export class IssueEntity {
    constructor(
        readonly id: IssueIdId,
        readonly projectIds: ProjectId[],
        readonly pullRequestIds: PullRequestId[],
        readonly repositoryIds: RepositoryId[],
    ) {
    }

    static create(props: IssueEntityProps): IssueEntity {
        return new IssueEntity(
            props.id,
            props.projectIds,
            props.pullRequestIds,
            props.repositoryIds,
        );
    }
}

export default IssueEntity;
