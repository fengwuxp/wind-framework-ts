import {BaseRequestMappingOptions, generateMapping, Mapping} from "./Mapping";
import {HttpMethod} from "wind-http";


/**
 * HeadMapping
 */
export const HeadMapping: Mapping = generateMapping<BaseRequestMappingOptions>(HttpMethod.HEAD);