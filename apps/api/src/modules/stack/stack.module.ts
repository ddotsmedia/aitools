import { Module } from "@nestjs/common";
import { StackService } from "./stack.service";
import { StackController } from "./stack.controller";

@Module({
  controllers: [StackController],
  providers: [StackService],
})
export class StackModule {}
