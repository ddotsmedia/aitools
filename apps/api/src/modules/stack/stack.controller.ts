import { Body, Controller, Post } from "@nestjs/common";
import { IsString, MaxLength, MinLength } from "class-validator";
import { StackService } from "./stack.service";

class RecommendDto {
  @IsString() @MinLength(3) @MaxLength(500) goal!: string;
}

@Controller()
export class StackController {
  constructor(private readonly stack: StackService) {}

  @Post("recommend")
  recommend(@Body() dto: RecommendDto) {
    return this.stack.recommend(dto.goal);
  }
}
