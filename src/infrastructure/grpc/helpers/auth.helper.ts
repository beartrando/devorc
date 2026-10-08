import * as grpc from '@grpc/grpc-js';
import {InvalidAuthorizationError} from "@shared/errors";
import SessionAccessToken from "../../../domain/session/value-objects/session-access-token.vo";

export class AuthHelper {
    static getAccessToken(
        call: grpc.ServerUnaryCall<any, any>
    ): SessionAccessToken {
        const authHeader = call.metadata.get('authorization')[0] as string;
        // logger.log(authHeader);
        if (!authHeader?.startsWith('Bearer ')) {
            throw new InvalidAuthorizationError();
        }

        return new SessionAccessToken(authHeader.slice(7));
    };

    static getMetadata(jwt: string): grpc.Metadata {
        const metadata = new grpc.Metadata();
        metadata.add('authorization', 'Bearer ' + jwt);
        return metadata;
    }
}

export default AuthHelper;
