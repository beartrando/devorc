import ProjectId from "../project/value-objects/project-id.vo";
import PullRequestId from "../pull-request/value-objects/pull-requet-id.vo";
import RepositoryId from "../repository/value-objects/repository-id.vo";
import IssueId from "./value-objects/issue-id.vo";


export type IssueEntityProps = {
    id: IssueId;
    projectIds: ProjectId[];
    pullRequestIds: PullRequestId[];
    repositoryIds: RepositoryId[];
};

export class IssueEntity {
    constructor(
        readonly id: IssueId,
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
